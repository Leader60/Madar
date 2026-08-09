export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, link } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  const PAGE_ID = process.env.FB_PAGE_ID;
  const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

  try {
    const params = new URLSearchParams({
      message,
      access_token: ACCESS_TOKEN,
    });

    if (link) {
      params.append('link', link);
    }

    const fbResponse = await fetch(
      `https://graph.facebook.com/${PAGE_ID}/feed`,
      {
        method: 'POST',
        body: params,
      }
    );

    const data = await fbResponse.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    return res.status(200).json({ success: true, postId: data.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
