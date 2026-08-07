import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // التحقق من السر المشترك (Authorization header من Supabase)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.WEBHOOK_SECRET}`;

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const record = payload.record;

    if (!record) {
      return NextResponse.json({ error: 'No record found' }, { status: 400 });
    }

    const title = record.title || '';
    const summary = record.summary || '';
    const slug = record.slug || '';
    const imageUrl = record.image_url || null;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const articleLink = `${siteUrl}/article/${slug}`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const captionText = `📰 ${title}\n\n${summary}\n\n🔗 ${articleLink}`;

    let telegramUrl: string;
    let body: Record<string, string>;

    if (imageUrl) {
      // إرسال مع صورة
      telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      body = {
        chat_id: chatId as string,
        photo: imageUrl,
        caption: captionText.slice(0, 1024),
      };
    } else {
      // إرسال نص فقط
      telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      body = {
        chat_id: chatId as string,
        text: captionText.slice(0, 4096),
      };
    }

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return NextResponse.json({ error: telegramResult }, { status: 500 });
    }

    return NextResponse.json({ success: true, telegramResult });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
