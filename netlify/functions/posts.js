// netlify/functions/posts.js
export default async (request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || '1';
  const tags = url.searchParams.get('tags') || '';

  const query = tags ? `&tags=${encodeURIComponent(tags)}` : '';
  const apiUrl = `https://yande.re/post.json?limit=30&page=\( {page} \){query}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!res.ok) throw new Error('API error');

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: '/api/posts' };
