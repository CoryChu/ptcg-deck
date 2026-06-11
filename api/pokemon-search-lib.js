const SEARCH_BASE = 'https://asia.pokemon-card.com/hk/card-search/list/';
const CARD_IMG_RE = /data-original="(https:\/\/asia\.pokemon-card\.com\/hk\/card-img\/[^"]+)"/g;

async function searchPokemonCards(keyword) {
  const q = String(keyword || '').trim();
  if (!q) return { ok: false, error: 'empty keyword', images: [] };

  const url = `${SEARCH_BASE}?keyword=${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-TW,zh-HK,zh;q=0.9,en;q=0.8',
      Referer: 'https://asia.pokemon-card.com/hk/card-search/',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    return { ok: false, error: `HTTP ${response.status}`, images: [] };
  }

  const html = await response.text();
  const images = [...new Set([...html.matchAll(CARD_IMG_RE)].map((m) => m[1]))];
  return { ok: true, keyword: q, images, count: images.length };
}

module.exports = { searchPokemonCards };
