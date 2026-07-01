'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { MOCK_STUDENTS, PIPELINE_STAGES, Student, PipelineStage } from '@/lib/data'
import { cn, getLeadScoreColor, getInitials } from '@/lib/utils'
import { GripVertical, Brain } from 'lucide-react'

export default function PipelinePage() {
  const [students, setStudents] = useState(MOCK_STUDENTS)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const handleDragStart = (id: string) => setDragging(id)
  const handleDragEnd = () => { setDragging(null); setDragOver(null) }

  const handleDrop = (stage: PipelineStage) => {
    if (!dragging) return
    setStudents(prev => prev.map(s => s.id === dragging ? { ...s, status: stage } : s))
    setDragging(null)
    setDragOver(null)
  }

  const stageColors: Record<string, string> = {
    'New Lead': 'border-slate-300',
    'Contacted': 'border-blue-300',
    'Consultation Scheduled': 'border-indigo-300',
    'Documents Requested': 'border-purple-300',
    'Documents Received': 'border-violet-300',
    'University Applied': 'border-orange-300',
    'Admission Received': 'border-yellow-300',
    'Scholarship Awarded': 'border-lime-300',
    'Visa Preparation': 'border-cyan-300',
    'Visa Interview': 'border-teal-300',
    'Visa Approved': 'border-green-300',
    'Travel Completed': 'border-emerald-400',
  }

  const stageHeaderColors: Record<string, string> = {
    'New Lead': 'bg-slate-100 text-slate-700',
    'Contacted': 'bg-blue-100 text-blue-700',
    'Consultation Scheduled': 'bg-indigo-100 text-indigo-700',
    'Documents Requested': 'bg-purple-100 text-purple-700',
    'Documents Received': 'bg-violet-100 text-violet-700',
    'University Applied': 'bg-orange-100 text-orange-700',
    'Admission Received': 'bg-yellow-100 text-yellow-700',
    'Scholarship Awarded': 'bg-lime-100 text-lime-700',
    'Visa Preparation': 'bg-cyan-100 text-cyan-700',
    'Visa Interview': 'bg-teal-100 text-teal-700',
    'Visa Approved': 'bg-green-100 text-green-700',
    'Travel Completed': 'bg-emerald-100 text-emerald-800',
  }

  return (
    <div className="animate-fade-in flex flex-col h-screen">
      <Header title="Student Pipeline" />
      <div className="p-4 flex-1 overflow-x-auto">
        <div className="flex gap-3 h-full min-w-max pb-4">
          {PIPELINE_STAGES.map(stage => {
            const stageStudents = students.filter(s => s.status === stage)
            return (
              <div
                key={stage}
                className={cn(
                  'w-52 flex flex-col rounded-2xl border-2 bg-white transition-all duration-150',
                  dragOver === stage ? 'border-blue-400 bg-blue-50/30 scale-[1.01]' : stageColors[stage]
                )}
                onDragOver={e => { e.preventDefault(); setDragOver(stage) }}
                onDrop={() => handleDrop(stage)}
                onDragLeave={() => setDragOver(null)}
              >
                {/* Column Header */}
                <div className={cn('px-3 py-2.5 rounded-t-xl flex items-center justify-between', stageHeaderColors[stage])}>
                  <span className="text-xs font-semibold truncate">{stage}</span>
                  <span className="text-xs font-bold ml-1 opacity-70 flex-shrink-0">{stageStudents.length}</span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin min-h-[120px]">
                  {stageStudents.map(s => (
                    <div
                      key={s.id}
                      draggable
                      onDragStart={() => handleDragStart(s.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'bg-white border border-slate-200 rounded-xl p-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all',
                        dragging === s.id && 'opacity-40 scale-95'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                          {getInitials(s.name)}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate flex-1">{s.name}</p>
                        <GripVertical size={11} className="text-slate-300 flex-shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mb-1.5">{s.major}</p>
                      <div className="flex items-center justify-between">
                        <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-md border', getLeadScoreColor(s.leadScore))}>
                          {s.leadScore}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Brain size={9} className="text-blue-400" />
                          <span className="text-[9px] text-slate-500 font-medium">{s.enrollmentProbability}%</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageStudents.length === 0 && (
                    <div className="h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-300">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
