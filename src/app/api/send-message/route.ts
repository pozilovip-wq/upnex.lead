import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side only — service key never exposed to browser
const crm = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  const { chatId, text } = await req.json()

  if (!chatId || !text?.trim()) {
    return NextResponse.json({ error: 'chatId and text are required' }, { status: 400 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 })
  }

  // Send via Telegram Bot API
  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!tgRes.ok) {
    const err = await tgRes.json().catch(() => ({}))
    return NextResponse.json({ error: 'Telegram API error', detail: err }, { status: 502 })
  }

  // Log as outgoing message in CRM messages table
  await crm.from('messages').insert({
    telegram_chat_id: chatId,
    direction: 'out',
    text,
  })

  return NextResponse.json({ ok: true })
}
