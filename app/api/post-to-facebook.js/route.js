export async function POST(request) {
  try {
    const { message, link } = await request.json();

    if (!message) {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    const PAGE_ID = process.env.FB_PAGE_ID;
    const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

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
      return Response.json({ error: data.error }, { status: 400 });
    }

    return Response.json({ success: true, postId: data.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
