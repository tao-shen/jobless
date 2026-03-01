import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_CAPTION_LIMIT = 1024;

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return NextResponse.json(
      { ok: false, error: 'Telegram API is not configured' },
      { status: 409 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });
  }

  const photoField = formData.get('photo');
  if (!(photoField instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Image file is required' }, { status: 400 });
  }

  const rawCaption = formData.get('caption');
  const caption = typeof rawCaption === 'string' ? rawCaption.trim() : '';
  const safeCaption =
    caption.length > TELEGRAM_CAPTION_LIMIT
      ? `${caption.slice(0, TELEGRAM_CAPTION_LIMIT - 3)}...`
      : caption;

  const upstreamForm = new FormData();
  upstreamForm.append('chat_id', chatId);
  upstreamForm.append('photo', photoField, photoField.name || 'ai-risk-result.png');
  if (safeCaption) upstreamForm.append('caption', safeCaption);

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: upstreamForm,
      cache: 'no-store',
    });

    const telegramData = await telegramResponse.json().catch(() => null);
    if (!telegramResponse.ok || !telegramData?.ok) {
      const description =
        typeof telegramData?.description === 'string'
          ? telegramData.description
          : 'Telegram API rejected the photo';
      return NextResponse.json(
        { ok: false, error: description },
        { status: 502 },
      );
    }

    const photos = Array.isArray(telegramData.result?.photo) ? telegramData.result.photo : [];
    const lastPhoto = photos.length > 0 ? photos[photos.length - 1] : null;
    return NextResponse.json({
      ok: true,
      messageId:
        typeof telegramData.result?.message_id === 'number'
          ? telegramData.result.message_id
          : null,
      fileId:
        typeof lastPhoto?.file_id === 'string'
          ? lastPhoto.file_id
          : null,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to connect to Telegram API' },
      { status: 502 },
    );
  }
}
