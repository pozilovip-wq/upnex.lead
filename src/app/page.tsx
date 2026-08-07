'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import StatCard, { StatCardSkeleton } from '@/components/dashboard/StatCard'
import { LeadsChart, CounselorChart } from '@/components/dashboard/Charts'
import AddStudentModal from '@/components/students/AddStudentModal'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { formatCurrency, getLeadScoreColor, cn } from '@/lib/utils'
import {
  Users, Flame, Phone, Clock, GraduationCap, FileText,
  CheckCircle, Plane, DollarSign, TrendingUp, Brain, Star, AlertCircle, Plus
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { students, loading, tasks, toggleTask } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [revenue, setRevenue] = useState(0)

  useEffect(() => {
    supabase.from('payments').select('amount').then(({ data }) => {
      if (data) setRevenue(data.reduce((s, p) => s + Number(p.amount), 0))
    })
  }, [])

  const hotLeads = students.filter(s => s.leadScore === 'Hot').length
  const activeStudents = students.filter(s => !['New Lead', 'Travel Completed'].includes(s.status)).length
  const visaApproved = students.filter(s => s.status === 'Visa Approved' || s.status === 'Travel Completed').length
  const admitted = students.filter(s => ['Admission Received', 'Scholarship Awarded', 'Visa Preparation', 'Visa Interview', 'Visa Approved', 'Travel Completed'].includes(s.status)).length
  const todayTasks = tasks.filter(t => t.dueDate === 'Today' && !t.done)
  const todayPrefix = new Date().toISOString().slice(0, 10)
  const newLeadsToday = students.filter(s => s.createdAt.slice(0, 10) === todayPrefix).length
  const uniApplied = students.filter(s => s.status === 'University Applied').length

  const urgentStudent = todayTasks[0]?.student

  return (
    <>
    <div className="animate-fade-in">
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* AI Insight Banner */}
        <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1e40af] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Brain size={20} className="text-blue-200" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">AI Daily Briefing</p>
            <p className="text-blue-200 text-xs mt-0.5">
              You have{' '}
              <button
                onClick={() => router.push('/tasks')}
                className="text-white font-bold underline-offset-2 hover:underline"
              >
                {todayTasks.length} urgent tasks
              </button>{' '}
              today.
              {urgentStudent && (
                <>
                  {' '}
                  <button
                    onClick={() => router.push(`/students?name=${encodeURIComponent(urgentStudent)}`)}
                    className="text-white font-bold underline-offset-2 hover:underline"
                  >
                    {urgentStudent}
                  </button>{' '}
                  needs immediate attention.
                </>
              )}
              {' '}Total{' '}
              <button
                onClick={() => router.push('/students')}
                className="text-white font-bold underline-offset-2 hover:underline"
              >
                {students.length} students
              </button>{' '}
              in your pipeline.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-150 hover:bg-blue-50 active:scale-[0.97] flex-shrink-0"
          >
            <Plus size={13} /> Add Lead
          </button>
        </div>

        {/* Stats Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? <>
            {[0,1,2,3,4].map(i => <StatCardSkeleton key={i} gradient={i===2 ? 'bg-gradient-to-br from-[#1e3a5f] to-[#2563eb]' : i===4 ? 'bg-gradient-to-br from-[#dc6b19] to-[#f59e0b]' : undefined} />)}
          </> : <>
            <div className="animate-stagger" style={{'--i': 0} as React.CSSProperties}>
              <StatCard title="New Leads Today" value={newLeadsToday} icon={Users} trend={12}
                onClick={() => router.push('/students?filter=today')} />
            </div>
            <div className="animate-stagger" style={{'--i': 1} as React.CSSProperties}>
              <StatCard title="Active Leads" value={students.length} icon={TrendingUp} trend={8}
                onClick={() => router.push('/students')} />
            </div>
            <div className="animate-stagger" style={{'--i': 2} as React.CSSProperties}>
              <StatCard title="Hot Leads" value={hotLeads} icon={Flame} gradient="bg-gradient-to-br from-[#1e3a5f] to-[#2563eb]"
                onClick={() => router.push('/students?score=Hot')} />
            </div>
            <div className="animate-stagger" style={{'--i': 3} as React.CSSProperties}>
              <StatCard title="Calls Today" value={4} icon={Phone}
                onClick={() => router.push('/tasks')} />
            </div>
            <div className="animate-stagger" style={{'--i': 4} as React.CSSProperties}>
              <StatCard title="Follow-ups Due" value={todayTasks.length} icon={Clock} gradient="bg-gradient-to-br from-[#dc6b19] to-[#f59e0b]"
                onClick={() => router.push('/tasks')} />
            </div>
          </>}
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? <>
            {[0,1,2,3,4].map(i => <StatCardSkeleton key={i} gradient={i===2 ? 'bg-gradient-to-br from-[#059669] to-[#10b981]' : i===3 ? 'bg-gradient-to-br from-[#7c3aed] to-[#a78bfa]' : undefined} />)}
          </> : <>
            <div className="animate-stagger" style={{'--i': 5} as React.CSSProperties}>
              <StatCard title="Active Students" value={activeStudents} icon={GraduationCap} trend={5}
                onClick={() => router.push('/students')} />
            </div>
            <div className="animate-stagger" style={{'--i': 6} as React.CSSProperties}>
              <StatCard title="Uni Applications" value={uniApplied} icon={FileText}
                onClick={() => router.push('/students?status=University+Applied')} />
            </div>
            <div className="animate-stagger" style={{'--i': 7} as React.CSSProperties}>
              <StatCard title="Admitted" value={admitted} icon={CheckCircle} gradient="bg-gradient-to-br from-[#059669] to-[#10b981]"
                onClick={() => router.push('/students?status=Admission+Received')} />
            </div>
            <div className="animate-stagger" style={{'--i': 8} as React.CSSProperties}>
              <StatCard title="Visa Approved" value={visaApproved} icon={Plane} gradient="bg-gradient-to-br from-[#7c3aed] to-[#a78bfa]"
                onClick={() => router.push('/students?status=Visa+Approved')} />
            </div>
            <div className="animate-stagger" style={{'--i': 9} as React.CSSProperties}>
              <StatCard title="Revenue" value={formatCurrency(revenue)} icon={DollarSign} trend={18} subtitle="All time"
                onClick={() => router.push('/reports')} />
            </div>
          </>}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadsChart />
          <CounselorChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AI Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">AI Task Manager</h3>
                <p className="text-xs text-slate-400">Click to mark as done</p>
              </div>
              <button
                onClick={() => router.push('/tasks')}
                className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {todayTasks.length} urgent →
              </button>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 6).map(task => (
                <div key={task.id} className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                  task.done ? 'opacity-50 bg-slate-50 border-slate-100' :
                  task.priority === 'high' ? 'border-red-100 bg-red-50/50 hover:bg-red-50' :
                  task.priority === 'medium' ? 'border-amber-100 bg-amber-50/50 hover:bg-amber-50' :
                  'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                )} onClick={() => toggleTask(task.id)}>
                  <AlertCircle size={15} className={cn(
                    'mt-0.5 flex-shrink-0',
                    task.done ? 'text-slate-300' :
                    task.priority === 'high' ? 'text-red-500' :
                    task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs text-slate-700 leading-relaxed', task.done && 'line-through text-slate-400')}>
                      <button
                        className="font-semibold hover:text-blue-600 hover:underline underline-offset-2 transition-colors"
                        onClick={e => { e.stopPropagation(); router.push(`/students?name=${encodeURIComponent(task.student)}`) }}
                      >
                        {task.student}
                      </button>
                      {' '}— {task.action}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Due: {task.dueDate}</p>
                  </div>
                  <button
                    className={cn('text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors flex-shrink-0',
                      task.done ? 'text-slate-400 bg-slate-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    )}
                    onClick={e => { e.stopPropagation(); toggleTask(task.id) }}
                  >
                    {task.done ? 'Undo' : 'Done'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Leads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Hot Leads</h3>
              <button onClick={() => router.push('/students?score=Hot')} className="hover:opacity-70 transition-opacity">
                <Star size={14} className="text-amber-400" />
              </button>
            </div>
            {students.filter(s => s.leadScore === 'Hot').length === 0 ? (
              <div className="text-center py-8">
                <Flame size={24} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No hot leads yet</p>
                <button onClick={() => setShowModal(true)} className="mt-2 text-xs text-blue-600 font-medium hover:underline">Add a lead</button>
              </div>
            ) : (
              <div className="space-y-3">
                {students.filter(s => s.leadScore === 'Hot').slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/students?name=${encodeURIComponent(s.name)}`)}
                    className="w-full flex items-center gap-3 hover:bg-slate-50 rounded-xl p-1 -mx-1 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{s.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{s.major} · {s.preferredCountry}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border', getLeadScoreColor(s.leadScore))}>
                        {s.leadScore}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">{s.enrollmentProbability}%</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
      {showModal && <AddStudentModal onClose={() => setShowModal(false)} />}
    </>
  )
}
