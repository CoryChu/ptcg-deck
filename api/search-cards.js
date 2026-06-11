const { searchPokemonCards } = require('./pokemon-search-lib');

module.exports = async (req, res) => {
  const keyword = req.query.keyword || req.query.q || '';

  if (!String(keyword).trim()) {
    res.status(400).json({ ok: false, error: 'missing keyword' });
    return;
  }

  try {
    const result = await searchPokemonCards(keyword);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(result.ok ? 200 : 502).json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, images: [] });
  }
};
