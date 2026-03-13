const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { page = 1, tags = '' } = req.query;
    const query = tags ? `&tags=${encodeURIComponent(tags)}` : '';
    const url = `https://yande.re/post.json?limit=30&page=\( {page} \){query}`;

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Proxy error' });
  }
};
