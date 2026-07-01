'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { MOCK_STUDENTS } from '@/lib/data'
import { getInitials, cn } from '@/lib/utils'
import { Send, Paperclip, Brain, MessageSquare } from 'lucide-react'

const CHANNELS = [
  { id: 'telegram', label: 'Telegram', icon: '✈️', color: 'text-blue-500' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'text-green-500' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'text-pink-500' },
  { id: 'email', label: 'Email', icon: '📧', color: 'text-slate-500' },
]

const MOCK_MESSAGES = [
  { id: 1, from: 'student', text: 'Hello, I wanted to check on my application status', time: '10:32 AM' },
  { id: 2, from: 'counselor', text: 'Hi Azizbek! Your documents are under review. We should have an update by end of week.', time: '10:35 AM' },
  { id: 3, from: 'student', text: 'Thank you! Do I need to send anything else?', time: '10:36 AM' },
  { id: 4, from: 'counselor', text: 'Please send your updated bank statement when you get a chance.', time: '10:38 AM' },
  { id: 5, from: 'student', text: 'Sure, I will send it today.', time: '10:39 AM' },
]

export default function MessagesPage() {
  const [selected, setSelected] = useState(MOCK_STUDENTS[0])
  const [channel, setChannel] = useState('telegram')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)

  const sendMessage = () => {
    if (!message.trim()) return
    setMessages(prev => [...prev, { id: prev.length + 1, from: 'counselor', text: message, time: 'Now' }])
    setMessage('')
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
      <Header title="Communication Center" />

      <div className="flex flex-1 overflow-hidden">
        {/* Student List */}
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {MOCK_STUDENTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-3 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                  selected.id === s.id && 'bg-blue-50 border-l-2 border-l-blue-500'
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(s.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">Last: {s.lastContact}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(selected.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-400">{selected.status} · {selected.counselor}</p>
              </div>
            </div>
            {/* Channel Switcher */}
            <div className="flex gap-1">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    channel === ch.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <span>{ch.icon}</span>
                  <span className="hidden sm:inline">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex', msg.from === 'counselor' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-xs px-4 py-2.5 rounded-2xl text-sm',
                  msg.from === 'counselor'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm'
                )}>
                  <p className="leading-relaxed text-xs">{msg.text}</p>
                  <p className={cn('text-[10px] mt-1', msg.from === 'counselor' ? 'text-blue-200' : 'text-slate-400')}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-200 p-4">
            <div className="flex gap-2 mb-2">
              <button
                className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={() => setMessage(`Hi ${selected.name.split(' ')[0]}, I wanted to follow up on your application. ${selected.nextAction}.`)}
              >
                <Brain size={12} />
                AI Generate Follow-up
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Paperclip size={16} className="text-slate-400" />
              </button>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={`Message via ${CHANNELS.find(c => c.id === channel)?.label}...`}
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
