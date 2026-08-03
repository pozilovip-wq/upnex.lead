'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Header from '@/components/layout/Header'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { getInitials, cn } from '@/lib/utils'
import { Send, Brain, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  direction: 'in' | 'out'
  text: string
  created_at: string
}

const JUNK_NAME = /^(unknown|aniqlanmagan|maktab|kollej|bakalavr|magistr|litsey|sinf|universitet|bachelor|master|phd|foundation|america|amerika|usa|aqsh|yevropa|europe|toshkent|samarqand|namangan|andijon|farg|buxoro|jizzax|navoiy|surxon|xorazm|ishlaydi|hech|graduated|ha|yo'q|\d+)$/i
const NAME_LIKE = /^[a-zA-ZÀ-žА-яёЎўҚқҒғҲҳ'\- ]{2,50}$/u

function displayName(name: string, telegram: string): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed || JUNK_NAME.test(trimmed) || !NAME_LIKE.test(trimmed)) {
    return telegram.startsWith('@') ? telegram : telegram || 'Unknown'
  }
  return trimmed
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
  const { students, loading } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Students who came through the bot (have a telegramChatId)
  const botStudents = students
    .filter(s => s.telegramChatId)
    .filter(s => {
      const q = search.toLowerCase()
      if (!q) return true
      return displayName(s.name, s.telegram).toLowerCase().includes(q) ||
        s.telegram.toLowerCase().includes(q)
    })

  const selected = botStudents.find(s => s.id === selectedId) ?? botStudents[0] ?? null

  // Auto-select first student
  useEffect(() => {
    if (!selectedId && botStudents.length > 0) setSelectedId(botStudents[0].id)
  }, [botStudents.length])

  // Load messages when selected student changes
  useEffect(() => {
    if (!selected?.telegramChatId) { setMessages([]); return }
    setMsgLoading(true)
    supabase
      .from('messages')
      .select('id, direction, text, created_at')
      .eq('telegram_chat_id', selected.telegramChatId)
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        setMessages((data ?? []) as Message[])
        setMsgLoading(false)
      })
  }, [selected?.telegramChatId])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!selected?.telegramChatId) return
    const channel = supabase
      .channel(`messages:${selected.telegramChatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `telegram_chat_id=eq.${selected.telegramChatId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selected?.telegramChatId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async () => {
    if (!text.trim() || !selected?.telegramChatId || sending) return
    setSending(true)
    setSendError(null)
    const payload = text.trim()
    setText('')

    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: selected.telegramChatId, text: payload }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setSendError(err.error ?? 'Failed to send. Check TELEGRAM_BOT_TOKEN in Netlify.')
      setText(payload) // restore so the user can retry
    }
    setSending(false)
  }, [text, selected, sending])

  const aiFollowUp = () => {
    if (!selected) return
    const name = displayName(selected.name, selected.telegram).split(' ')[0]
    setText(`Assalomu alaykum, ${name}! Upnex jamoasidan murojaat qilamiz. ${selected.nextAction || 'Hujjatlaringiz haqida ma\'lumot bersangiz bo\'ladi.'}`)
  }

  if (loading) {
    return (
      <div className="animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
        <Header title="Communication Center" />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
      <Header title="Communication Center" />

      <div className="flex flex-1 overflow-hidden">
        {/* Student list — only bot leads */}
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Telegram Conversations ({botStudents.length})
            </p>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2.5 py-1.5 text-xs bg-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 text-slate-700 placeholder-slate-400"
            />
          </div>

          {botStudents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <div>
                <MessageSquare size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No Telegram leads yet</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {botStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 px-3 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                    selected?.id === s.id && 'bg-blue-50 border-l-2 border-l-blue-500'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(displayName(s.name, s.telegram))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{displayName(s.name, s.telegram)}</p>
                    <p className="text-[10px] text-slate-400 truncate">{s.telegram || s.telegramChatId}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat area */}
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm bg-slate-50">
            Select a student to view their conversation
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-50">
            {/* Chat header */}
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(displayName(selected.name, selected.telegram))}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{displayName(selected.name, selected.telegram)}</p>
                <p className="text-xs text-slate-400">
                  {selected.telegram || `ID: ${selected.telegramChatId}`} · {selected.status}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
              {msgLoading && (
                <p className="text-center text-xs text-slate-400 py-4">Loading messages...</p>
              )}
              {!msgLoading && messages.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">
                  No messages yet. Send one below to start the conversation.
                </p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={cn('flex', msg.direction === 'out' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-xs px-4 py-2.5 rounded-2xl text-sm',
                    msg.direction === 'out'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm'
                  )}>
                    <p className="leading-relaxed text-xs whitespace-pre-wrap">{msg.text}</p>
                    <p className={cn('text-[10px] mt-1', msg.direction === 'out' ? 'text-blue-200' : 'text-slate-400')}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Send error */}
            {sendError && (
              <div className="mx-4 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {sendError}
              </div>
            )}

            {/* Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex gap-2 mb-2">
                <button
                  className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={aiFollowUp}
                >
                  <Brain size={12} />
                  AI Generate Follow-up
                </button>
              </div>
              <div className="flex items-center gap-2">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Message via Telegram... (Enter to send, Shift+Enter for newline)"
                  rows={2}
                  className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
