'use client'

import { useState } from 'react'
import { Bell, Search, X } from 'lucide-react'
import { NOTIFICATIONS } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function Header({ title }: { title: string }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  const iconMap: Record<string, string> = {
    reply: '💬',
    overdue: '⚠️',
    deadline: '📅',
    document: '📄',
    visa: '✅',
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <Search size={15} className="absolute left-3 text-slate-400" />
          <input
            placeholder="Search students, tasks..."
            className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 w-56 transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell size={18} className="text-slate-600" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                <button onClick={() => setShowNotifications(false)}>
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className={cn('flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors', !n.read && 'bg-blue-50/50')}>
                    <span className="text-lg flex-shrink-0">{iconMap[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center">
                <button className="text-xs text-blue-600 font-medium hover:underline">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  )
}
