const { resolveChineseCardName } = require('./card-name-resolve-lib');

module.exports = async (req, res) => {
  const name = req.query.name || req.query.keyword || req.query.q || '';

  if (!String(name).trim()) {
    res.status(400).json({ ok: false, error: 'missing name' });
    return;
  }

  try {
    const result = await resolveChineseCardName(name);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(result.ok ? 200 : 404).json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, chineseName: null });
  }
};
