function detectImageMime(buffer) {
  if (buffer.length < 4) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp';
  return null;
}

async function fetchWithHeaders(url, referer) {
  const parsed = new URL(url);
  const originReferer = `${parsed.protocol}//${parsed.host}/`;

  return fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      Referer: referer || originReferer,
    },
    redirect: 'follow',
  });
}

module.exports = async (req, res) => {
  const url = req.query.url;
  const referer = req.query.referer || '';

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

    const variants = [url];
    const noQuery = parsed.origin + parsed.pathname;
    if (noQuery !== url) variants.push(noQuery);

    let lastStatus = 500;

    for (const variant of variants) {
      const response = await fetchWithHeaders(variant, referer);
      lastStatus = response.status;

      if (!response.ok) continue;

      const buffer = Buffer.from(await response.arrayBuffer());
      let contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || '';

      if (!contentType.startsWith('image/')) {
        const detected = detectImageMime(buffer);
        if (detected) contentType = detected;
        else continue;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(buffer);
      return;
    }

    res.status(lastStatus).json({ error: `HTTP ${lastStatus}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
