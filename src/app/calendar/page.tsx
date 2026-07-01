'use client'

import Header from '@/components/layout/Header'
import { CALENDAR_EVENTS } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Calendar, Phone, Video, Clock, Flag } from 'lucide-react'

const TYPE_CONFIG = {
  call: { label: 'Call', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Phone },
  meeting: { label: 'Meeting', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Video },
  deadline: { label: 'Deadline', color: 'bg-red-100 text-red-700 border-red-200', icon: Flag },
  interview: { label: 'Interview', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const today = new Date(2026, 5, 30) // June 30, 2026
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return CALENDAR_EVENTS.filter(e => e.date === dateStr)
  }

  return (
    <div className="animate-fade-in">
      <Header title="Calendar" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">‹</button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 pb-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const events = getEventsForDay(day)
              const isToday = day === 30
              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-[72px] rounded-xl p-1.5 border transition-colors',
                    day ? 'hover:bg-slate-50 cursor-pointer' : '',
                    isToday ? 'border-blue-400 bg-blue-50' : 'border-transparent'
                  )}
                >
                  {day && (
                    <>
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1',
                        isToday ? 'bg-blue-600 text-white' : 'text-slate-600'
                      )}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {events.slice(0, 2).map(e => {
                          const cfg = TYPE_CONFIG[e.type as keyof typeof TYPE_CONFIG]
                          return (
                            <div key={e.id} className={cn('text-[9px] px-1 py-0.5 rounded font-medium truncate border', cfg.color)}>
                              {e.title}
                            </div>
                          )
                        })}
                        {events.length > 2 && <div className="text-[9px] text-slate-400">+{events.length - 2} more</div>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {CALENDAR_EVENTS.map(event => {
                const cfg = TYPE_CONFIG[event.type as keyof typeof TYPE_CONFIG]
                const Icon = cfg.icon
                return (
                  <div key={event.id} className={cn('flex items-start gap-3 p-3 rounded-xl border', cfg.color)}>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{event.title}</p>
                      <p className="text-[10px] text-slate-500">{event.date} · {event.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Event Types</h3>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const Icon = cfg.icon
              return (
                <div key={type} className="flex items-center gap-2 mb-2">
                  <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center border text-[10px]', cfg.color)}>
                    <Icon size={11} />
                  </div>
                  <span className="text-xs text-slate-600">{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
