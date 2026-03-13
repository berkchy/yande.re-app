// api/view.js
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL eksik');

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(response.data));
  } catch (err) {
    res.status(500).send('Resim proxy hatası');
  }
};