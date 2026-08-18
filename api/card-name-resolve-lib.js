const POKE52_SEARCH = 'https://wiki.52poke.com/wiki/Special:Search';
const DDG_SEARCH = 'https://html.duckduckgo.com/html/';

const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
const HEADING_RE = /class="mw-search-result-heading"[^>]*>\s*<a[^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
const TCG_TITLE_RE = /([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff][\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff·\s]{0,24}?)（Tcg）/gi;
const BOOK_TITLE_RE = /『([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff][^』]{1,30})』/g;
const EN_IN_SNIPPET_RE = /([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff][^（]{1,30}?)（[^）]*英文︰[^）]*）/g;

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'zh-TW,zh-HK,zh;q=0.9,en;q=0.8',
};

// #region agent log
function agentLog(hypothesisId, location, message, data) {
  fetch('http://127.0.0.1:7583/ingest/12998ea6-7861-4a76-b083-c5c30819e1e2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '40b010' },
    body: JSON.stringify({
      sessionId: '40b010',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
      runId: data?.runId || 'pre-fix',
    }),
  }).catch(() => {});
}
// #endregion

function hasCjk(text) {
  return CJK_RE.test(String(text || ''));
}

function normalizeEnglish(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[''']/g, "'")
    .replace(/\s+/g, ' ');
}

function extractChineseBase(title) {
  const trimmed = String(title || '').trim();
  if (!trimmed || !hasCjk(trimmed)) return null;
  const base = trimmed.split('（')[0].trim();
  return hasCjk(base) ? base : null;
}

function englishMatchesSnippet(snippet, englishName) {
  const normalizedEn = normalizeEnglish(englishName);
  const decoded = snippet
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ');
  const normalizedSnippet = normalizeEnglish(decoded);
  return normalizedSnippet.includes(normalizedEn);
}

function parse52pokeResults(html, englishName) {
  const tcgMatches = [];
  const snippetMatches = [];
  let block;
  const blockRe = /class="mw-search-result[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;

  while ((block = blockRe.exec(html)) !== null) {
    const chunk = block[1];
    const heading = chunk.match(/class="mw-search-result-heading"[^>]*>\s*<a[^>]*title="([^"]+)"/i);
    if (!heading) continue;

    const title = heading[1].trim();
    if (title.includes('（TCG）')) {
      const chinese = extractChineseBase(title);
      if (chinese) tcgMatches.push(chinese);
    }

    const snippet = chunk.match(/class="searchresult">([\s\S]*?)<\/div>/i)?.[1] || '';
    if (englishMatchesSnippet(snippet, englishName)) {
      const inline = snippet.match(/([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff][^（<]{1,30}?)（[^）]*英文︰/);
      if (inline) {
        const chinese = inline[1].trim();
        if (hasCjk(chinese)) snippetMatches.push(chinese);
      }
    }
  }

  if (snippetMatches.length > 0) return snippetMatches[0];
  if (tcgMatches.length > 0) return tcgMatches[0];
  return null;
}

function parseWebSearchResults(html) {
  const found = new Set();

  for (const re of [BOOK_TITLE_RE, TCG_TITLE_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(html)) !== null) {
      const name = match[1].trim();
      if (hasCjk(name) && name.length <= 20) found.add(name);
    }
  }

  EN_IN_SNIPPET_RE.lastIndex = 0;
  let snippetMatch;
  while ((snippetMatch = EN_IN_SNIPPET_RE.exec(html)) !== null) {
    const name = snippetMatch[1].trim();
    if (hasCjk(name)) found.add(name);
  }

  return [...found];
}

async function fetch52pokeChineseName(englishName) {
  const url = `${POKE52_SEARCH}?search=${encodeURIComponent(englishName)}&fulltext=1`;
  const response = await fetch(url, {
    headers: { ...FETCH_HEADERS, Referer: 'https://wiki.52poke.com/' },
    redirect: 'follow',
  });
  if (!response.ok) return null;

  const html = await response.text();
  return parse52pokeResults(html, englishName);
}

async function fetchWebSearchChineseName(englishName) {
  const query = `ptcg ${englishName} 中文`;
  const body = new URLSearchParams({ q: query, b: '', kl: 'wt-wt' });
  const response = await fetch(DDG_SEARCH, {
    method: 'POST',
    headers: {
      ...FETCH_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://html.duckduckgo.com/',
    },
    body: body.toString(),
    redirect: 'follow',
  });
  if (!response.ok) return null;

  const html = await response.text();
  const candidates = parseWebSearchResults(html);
  return candidates[0] || null;
}

async function resolveChineseCardName(englishName) {
  const originalName = String(englishName || '').trim();
  if (!originalName) {
    return { ok: false, error: 'empty name', originalName, chineseName: null, source: null };
  }

  if (hasCjk(originalName)) {
    // #region agent log
    agentLog('H1', 'card-name-resolve-lib.js:resolveChineseCardName', 'skip lookup (already CJK)', {
      originalName,
      chineseName: originalName,
      source: 'input',
    });
    // #endregion
    return { ok: true, originalName, chineseName: originalName, source: 'input' };
  }

  // #region agent log
  agentLog('H1', 'card-name-resolve-lib.js:resolveChineseCardName', 'english name needs lookup', {
    originalName,
  });
  // #endregion

  let chineseName = null;
  let source = null;

  try {
    chineseName = await fetch52pokeChineseName(originalName);
    if (chineseName) source = '52poke';
  } catch (err) {
    // #region agent log
    agentLog('H2', 'card-name-resolve-lib.js:fetch52poke', '52poke lookup failed', {
      originalName,
      error: err.message,
    });
    // #endregion
  }

  if (!chineseName) {
    try {
      chineseName = await fetchWebSearchChineseName(originalName);
      if (chineseName) source = 'web-search';
    } catch (err) {
      // #region agent log
      agentLog('H3', 'card-name-resolve-lib.js:fetchWebSearch', 'web search lookup failed', {
        originalName,
        error: err.message,
      });
      // #endregion
    }
  }

  // #region agent log
  agentLog(chineseName ? 'H2' : 'H3', 'card-name-resolve-lib.js:resolveChineseCardName', 'lookup result', {
    originalName,
    chineseName,
    source,
    resolved: Boolean(chineseName),
  });
  // #endregion

  if (!chineseName) {
    return { ok: false, originalName, chineseName: null, source: null, error: 'no chinese name found' };
  }

  return { ok: true, originalName, chineseName, source };
}

module.exports = {
  hasCjk,
  resolveChineseCardName,
};
