'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { AI_TASKS } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Brain, CheckCircle, Circle, Zap, AlertCircle, Clock } from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState(AI_TASKS)
  const [generating, setGenerating] = useState(false)

  const toggle = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 2000)
  }

  const priorityMap = {
    high: { label: 'High Priority', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle, iconColor: 'text-red-500' },
    medium: { label: 'Medium Priority', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, iconColor: 'text-amber-500' },
    low: { label: 'Low Priority', color: 'text-slate-600 bg-slate-50 border-slate-200', icon: Circle, iconColor: 'text-slate-400' },
  }

  const grouped = {
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low'),
  }

  return (
    <div className="animate-fade-in">
      <Header title="AI Task Manager" />

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1e3a8a] rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Brain size={24} className="text-blue-200" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">AI Daily Task Manager</h2>
              <p className="text-blue-200 text-xs">Generated today at 8:00 AM · {tasks.filter(t => !t.done).length} tasks remaining</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Zap size={15} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'bg-blue-600' },
            { label: 'Completed', value: tasks.filter(t => t.done).length, color: 'bg-emerald-500' },
            { label: 'Remaining', value: tasks.filter(t => !t.done).length, color: 'bg-amber-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <div className={cn('text-2xl font-bold text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2', stat.color)}>
                {stat.value}
              </div>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Task Groups */}
        {(['high', 'medium', 'low'] as const).map(priority => {
          const group = grouped[priority]
          const { label, color, icon: Icon, iconColor } = priorityMap[priority]
          return (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={iconColor} />
                <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                <span className="text-xs text-slate-400">({group.length})</span>
              </div>
              <div className="space-y-2">
                {group.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-xl border transition-all',
                      task.done ? 'bg-slate-50 opacity-60' : color
                    )}
                  >
                    <button onClick={() => toggle(task.id)} className="flex-shrink-0 mt-0.5">
                      {task.done
                        ? <CheckCircle size={18} className="text-emerald-500" />
                        : <Circle size={18} className="text-slate-400" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold', task.done ? 'text-slate-400 line-through' : 'text-slate-800')}>
                        {task.student}
                      </p>
                      <p className={cn('text-xs mt-0.5 leading-relaxed', task.done ? 'text-slate-300 line-through' : 'text-slate-600')}>
                        {task.action}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
