import { NextRequest, NextResponse } from 'next/server';

type TelegramSharePayload = {
  text?: string;
  url?: string;
};

const TELEGRAM_MESSAGE_LIMIT = 4096;

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let payload: TelegramSharePayload;
  try {
    payload = (await request.json()) as TelegramSharePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  const url = typeof payload.url === 'string' ? payload.url.trim() : '';
  const rawMessage = [text, url].filter(Boolean).join('\n');
  if (!rawMessage) {
    return NextResponse.json({ ok: false, error: 'Share text is empty' }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return NextResponse.json(
      { ok: false, error: 'Telegram API is not configured' },
      { status: 409 },
    );
  }

  const message =
    rawMessage.length > TELEGRAM_MESSAGE_LIMIT
      ? `${rawMessage.slice(0, TELEGRAM_MESSAGE_LIMIT - 3)}...`
      : rawMessage;

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: false,
      }),
      cache: 'no-store',
    });

    const telegramData = await telegramResponse.json().catch(() => null);
    if (!telegramResponse.ok || !telegramData?.ok) {
      const description =
        typeof telegramData?.description === 'string'
          ? telegramData.description
          : 'Telegram API rejected the message';
      return NextResponse.json(
        { ok: false, error: description },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      messageId:
        typeof telegramData.result?.message_id === 'number'
          ? telegramData.result.message_id
          : null,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to connect to Telegram API' },
      { status: 502 },
    );
  }
}
