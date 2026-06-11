module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'missing url' });
    return;
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      res.status(400).json({ error: 'invalid protocol' });
      return;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PTCGDeck/1.0)',
        Accept: 'image/*,*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      res.status(response.status).json({ error: `HTTP ${response.status}` });
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    if (!contentType.startsWith('image/')) {
      res.status(400).json({ error: 'not an image' });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
