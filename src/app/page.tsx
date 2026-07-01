'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/dashboard/StatCard'
import { LeadsChart, CounselorChart } from '@/components/dashboard/Charts'
import AddStudentModal from '@/components/students/AddStudentModal'
import { useStore } from '@/lib/store'
import { formatCurrency, getLeadScoreColor, cn } from '@/lib/utils'
import {
  Users, Flame, Phone, Clock, GraduationCap, FileText,
  CheckCircle, Plane, DollarSign, TrendingUp, Brain, Star, AlertCircle, Plus
} from 'lucide-react'

export default function Dashboard() {
  const { students, tasks, toggleTask } = useStore()
  const [showModal, setShowModal] = useState(false)

  const hotLeads = students.filter(s => s.leadScore === 'Hot').length
  const activeStudents = students.filter(s => !['New Lead', 'Travel Completed'].includes(s.status)).length
  const visaApproved = students.filter(s => s.status === 'Visa Approved' || s.status === 'Travel Completed').length
  const admitted = students.filter(s => ['Admission Received', 'Scholarship Awarded', 'Visa Preparation', 'Visa Interview', 'Visa Approved', 'Travel Completed'].includes(s.status)).length
  const todayTasks = tasks.filter(t => t.dueDate === 'Today' && !t.done)
  const newLeadsToday = students.filter(s => s.createdAt === new Date().toISOString().slice(0, 10)).length

  return (
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
              You have <span className="text-white font-bold">{todayTasks.length} urgent tasks</span> today.
              {todayTasks[0] && <> {todayTasks[0].student} needs immediate attention.</>}
              {' '}Total <span className="text-white font-bold">{students.length} students</span> in your pipeline.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors hover:bg-blue-50 flex-shrink-0"
          >
            <Plus size={13} /> Add Lead
          </button>
        </div>

        {/* Stats Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="New Leads Today" value={newLeadsToday || 14} icon={Users} trend={12} />
          <StatCard title="Active Leads" value={students.length} icon={TrendingUp} trend={8} />
          <StatCard title="Hot Leads" value={hotLeads} icon={Flame} gradient="bg-gradient-to-br from-[#1e3a5f] to-[#2563eb]" />
          <StatCard title="Calls Today" value={4} icon={Phone} />
          <StatCard title="Follow-ups Due" value={todayTasks.length} icon={Clock} gradient="bg-gradient-to-br from-[#dc6b19] to-[#f59e0b]" />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Active Students" value={activeStudents} icon={GraduationCap} trend={5} />
          <StatCard title="Uni Applications" value={students.filter(s => s.status === 'University Applied').length} icon={FileText} />
          <StatCard title="Admitted" value={admitted} icon={CheckCircle} gradient="bg-gradient-to-br from-[#059669] to-[#10b981]" />
          <StatCard title="Visa Approved" value={visaApproved} icon={Plane} gradient="bg-gradient-to-br from-[#7c3aed] to-[#a78bfa]" />
          <StatCard title="Revenue" value={formatCurrency(237000)} icon={DollarSign} trend={18} subtitle="This quarter" />
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
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                {todayTasks.length} urgent
              </span>
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
                      <span className="font-semibold">{task.student}</span> — {task.action}
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
              <Star size={14} className="text-amber-400" />
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
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{s.major} · {s.preferredCountry}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border', getLeadScoreColor(s.leadScore))}>
                        {s.leadScore}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">{s.enrollmentProbability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && <AddStudentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
