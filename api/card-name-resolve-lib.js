const {
  parse52pokeSearchItems,
  parseWebSearchResults,
  hasCjk,
  toTraditionalForHk,
} = require('./card-name-parse-lib');

const POKE52_API = 'https://wiki.52poke.com/api.php';
const POKE52_SEARCH = 'https://wiki.52poke.com/wiki/Special:Search';
const DDG_SEARCH = 'https://html.duckduckgo.com/html/';

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
      runId: data?.runId || 'post-fix',
    }),
  }).catch(() => {});
}
// #endregion

function finalizeChineseName(name) {
  if (!name) return null;
  return toTraditionalForHk(name.trim());
}

function parse52pokeResults(html, englishName) {
  const items = [];
  let block;
  const blockRe = /class="mw-search-result[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;

  while ((block = blockRe.exec(html)) !== null) {
    const chunk = block[1];
    const heading = chunk.match(/class="mw-search-result-heading"[^>]*>\s*<a[^>]*title="([^"]+)"/i);
    if (!heading) continue;

    items.push({
      title: heading[1].trim(),
      snippet: chunk.match(/class="searchresult">([\s\S]*?)<\/div>/i)?.[1] || '',
    });
  }

  return parse52pokeSearchItems(items, englishName);
}

async function query52pokeSearch(searchTerm, englishName) {
  const url = `${POKE52_API}?${new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: searchTerm,
    format: 'json',
  }).toString()}`;
  const response = await fetch(url, {
    headers: { ...FETCH_HEADERS, Referer: 'https://wiki.52poke.com/' },
    redirect: 'follow',
  });
  if (!response.ok) return null;

  const data = await response.json();
  const items = data?.query?.search || [];
  return parse52pokeSearchItems(items, englishName);
}

async function fetch52pokeChineseNameViaApi(englishName) {
  const queries = [
    englishName,
    `${englishName} TCG`,
    `ptcg ${englishName}`,
  ];

  for (const query of queries) {
    const parsed = await query52pokeSearch(query, englishName);
    if (parsed) {
      // #region agent log
      agentLog('H8', 'card-name-resolve-lib.js:fetch52pokeApi', '52poke API parsed', {
        originalName: englishName,
        query,
        parsed,
      });
      // #endregion
      return parsed;
    }
  }
  return null;
}

async function fetch52pokeChineseNameViaHtml(englishName) {
  const url = `${POKE52_SEARCH}?search=${encodeURIComponent(englishName)}&fulltext=1`;
  const response = await fetch(url, {
    headers: { ...FETCH_HEADERS, Referer: 'https://wiki.52poke.com/' },
    redirect: 'follow',
  });
  if (!response.ok) return null;

  const html = await response.text();
  if (!html.includes('mw-search-result-heading')) return null;
  return parse52pokeResults(html, englishName);
}

async function fetch52pokeChineseName(englishName) {
  const viaApi = await fetch52pokeChineseNameViaApi(englishName);
  if (viaApi) return viaApi;
  return fetch52pokeChineseNameViaHtml(englishName);
}

async function fetchWebSearchChineseName(englishName) {
  const queries = [
    `ptcg ${englishName} 中文`,
    `ptcg ${englishName} 官方中文`,
  ];

  for (const query of queries) {
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
    if (!response.ok) continue;

    const html = await response.text();
    const parsed = parseWebSearchResults(html, englishName);
    if (parsed) {
      // #region agent log
      agentLog('H9', 'card-name-resolve-lib.js:fetchWebSearch', 'web search parsed', {
        originalName: englishName,
        query,
        parsed,
      });
      // #endregion
      return parsed;
    }
  }

  return null;
}

async function resolveChineseCardName(englishName) {
  const originalName = String(englishName || '').trim();
  if (!originalName) {
    return { ok: false, error: 'empty name', originalName, chineseName: null, source: null };
  }

  if (hasCjk(originalName)) {
    return { ok: true, originalName, chineseName: originalName, source: 'input' };
  }

  let chineseName = null;
  let source = null;

  try {
    chineseName = await fetch52pokeChineseName(originalName);
    if (chineseName) source = '52poke';
  } catch (err) {
    agentLog('H2', 'card-name-resolve-lib.js:fetch52poke', '52poke lookup failed', {
      originalName,
      error: err.message,
    });
  }

  if (!chineseName) {
    try {
      chineseName = await fetchWebSearchChineseName(originalName);
      if (chineseName) source = 'web-search';
    } catch (err) {
      agentLog('H3', 'card-name-resolve-lib.js:fetchWebSearch', 'web search lookup failed', {
        originalName,
        error: err.message,
      });
    }
  }

  chineseName = finalizeChineseName(chineseName);

  agentLog(chineseName ? 'H8' : 'H9', 'card-name-resolve-lib.js:resolveChineseCardName', 'lookup result', {
    originalName,
    chineseName,
    source,
    resolved: Boolean(chineseName),
  });

  if (!chineseName) {
    return { ok: false, originalName, chineseName: null, source: null, error: 'no chinese name found' };
  }

  return { ok: true, originalName, chineseName, source };
}

module.exports = {
  hasCjk,
  resolveChineseCardName,
  toTraditionalForHk,
};
