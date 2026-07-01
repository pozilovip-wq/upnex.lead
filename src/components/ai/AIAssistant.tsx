'use client'

import { useState } from 'react'
import { Student } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Brain, Mail, MessageSquare, Target, Zap, Copy, Check, AlertCircle, Key, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  student: Student
}

const MODES = [
  { id: 'analyze', label: 'Analyze Lead', icon: Brain, color: 'bg-blue-600', desc: 'Full analysis + university recommendations' },
  { id: 'action_plan', label: 'Sales Action Plan', icon: Target, color: 'bg-purple-600', desc: 'Step-by-step plan to close this deal' },
  { id: 'email', label: 'Write Email', icon: Mail, color: 'bg-emerald-600', desc: 'Personalized follow-up email' },
  { id: 'whatsapp', label: 'WhatsApp/Telegram', icon: MessageSquare, color: 'bg-green-500', desc: 'Short chat message to get a response' },
  { id: 'summary', label: 'Quick Summary', icon: Zap, color: 'bg-amber-500', desc: '3-sentence briefing for your manager' },
]

function formatResult(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-slate-800 mt-3 mb-1 text-sm">{line.replace(/\*\*/g, '')}</p>
    }
    if (/^\*\*(.+?)\*\*/.test(line)) {
      return <p key={i} className="text-sm text-slate-700 leading-relaxed mb-1" dangerouslySetInnerHTML={{
        __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      }} />
    }
    if (line.match(/^\d+\.\s/)) {
      return <p key={i} className="text-sm text-slate-700 leading-relaxed mb-1 pl-2">{line}</p>
    }
    if (line.startsWith('- ')) {
      return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-0.5 pl-3 before:content-['•'] before:mr-2 before:text-blue-500">{line.slice(2)}</p>
    }
    if (line.trim() === '') return <div key={i} className="h-1" />
    return <p key={i} className="text-sm text-slate-700 leading-relaxed mb-1">{line}</p>
  })
}

export default function AIAssistant({ student }: Props) {
  const [mode, setMode] = useState<string | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [apiKey, setApiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('openai_key') || '' : '')

  const saveKey = (k: string) => {
    setApiKey(k)
    if (typeof window !== 'undefined') localStorage.setItem('openai_key', k)
  }

  const run = async (m: string) => {
    setMode(m)
    setResult('')
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student, mode: m, apiKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.includes('API key') || data.error?.includes('No OpenAI')) {
          setShowKeyInput(true)
        }
        setError(data.error || 'Something went wrong')
      } else {
        setResult(data.result)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Brain size={16} className="text-blue-300" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">AI Sales Assistant</p>
          <p className="text-slate-400 text-xs">Powered by GPT-4o · Select an action below</p>
        </div>
      </div>

      {/* API Key setup */}
      <div className="px-5 py-3 border-b border-white/10">
        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <Key size={11} />
          {apiKey ? '✓ OpenAI key set' : '⚠ Set OpenAI API key to enable AI'}
          {showKeyInput ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
        {showKeyInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => saveKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-blue-400"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Mode Buttons */}
      <div className="p-4 grid grid-cols-1 gap-2">
        {MODES.map(m => {
          const Icon = m.icon
          const active = mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => run(m.id)}
              disabled={loading}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border',
                active && !loading && result
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'border-white/10 text-slate-300 hover:bg-white/8 hover:text-white hover:border-white/20',
                loading && mode === m.id && 'opacity-60'
              )}
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', m.color)}>
                <Icon size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{m.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{m.desc}</p>
              </div>
              {loading && mode === m.id && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Result */}
      {(result || error || (loading && mode)) && (
        <div className="mx-4 mb-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {/* Result header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <span className="text-xs font-semibold text-slate-300">
              {MODES.find(m => m.id === mode)?.label}
            </span>
            {result && (
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-4 py-3 max-h-80 overflow-y-auto scrollbar-thin">
            {loading && !result && (
              <div className="flex items-center gap-3 py-4">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
                <span className="text-slate-400 text-xs">AI is analyzing {student.name}...</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 py-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs leading-relaxed">{error}</p>
              </div>
            )}
            {result && (
              <div className="text-sm leading-relaxed">
                {formatResult(result)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
