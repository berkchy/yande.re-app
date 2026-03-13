const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, tags = '' } = req.query;
    const query = tags ? `&tags=${encodeURIComponent(tags)}` : '';
    const url = `https://yande.re/post.json?limit=30&page=\( {page} \){query}`;

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YandeProxy/1.0)' }
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'API hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy sunucu ${PORT} portunda çalışıyor`);
});