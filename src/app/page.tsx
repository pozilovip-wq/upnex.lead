'use client'

import Header from '@/components/layout/Header'
import StatCard from '@/components/dashboard/StatCard'
import { LeadsChart, CounselorChart } from '@/components/dashboard/Charts'
import { AI_TASKS, MOCK_STUDENTS } from '@/lib/data'
import { formatCurrency, getLeadScoreColor, cn } from '@/lib/utils'
import {
  Users, Flame, Phone, Clock, GraduationCap, FileText,
  CheckCircle, Plane, DollarSign, TrendingUp, Brain, Star, AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const hotLeads = MOCK_STUDENTS.filter(s => s.leadScore === 'Hot').length
  const activeStudents = MOCK_STUDENTS.filter(s => !['New Lead', 'Travel Completed'].includes(s.status)).length
  const visaApproved = MOCK_STUDENTS.filter(s => s.status === 'Visa Approved' || s.status === 'Travel Completed').length
  const admitted = MOCK_STUDENTS.filter(s => ['Admission Received', 'Scholarship Awarded', 'Visa Preparation', 'Visa Interview', 'Visa Approved', 'Travel Completed'].includes(s.status)).length
  const todayTasks = AI_TASKS.filter(t => t.dueDate === 'Today' && !t.done)

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
              Azizbek hasn&apos;t replied in 5 days. Dilshod&apos;s deadline is approaching. Muhammad needs visa practice scheduled.
            </p>
          </div>
          <button className="bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors flex-shrink-0">
            View Tasks
          </button>
        </div>

        {/* Stats Grid Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="New Leads Today" value={14} icon={Users} trend={12} />
          <StatCard title="Active Leads" value={MOCK_STUDENTS.length} icon={TrendingUp} trend={8} />
          <StatCard title="Hot Leads" value={hotLeads} icon={Flame} gradient="bg-gradient-to-br from-[#1e3a5f] to-[#2563eb]" />
          <StatCard title="Calls Today" value={4} icon={Phone} />
          <StatCard title="Follow-ups Due" value={todayTasks.length} icon={Clock} gradient="bg-gradient-to-br from-[#dc6b19] to-[#f59e0b]" />
        </div>

        {/* Stats Grid Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Active Students" value={activeStudents} icon={GraduationCap} trend={5} />
          <StatCard title="Uni Applications" value={3} icon={FileText} />
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
                <p className="text-xs text-slate-400">Generated at 8:00 AM today</p>
              </div>
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                {todayTasks.length} urgent
              </span>
            </div>
            <div className="space-y-2">
              {AI_TASKS.map(task => (
                <div key={task.id} className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border transition-colors',
                  task.priority === 'high' ? 'border-red-100 bg-red-50/50' :
                  task.priority === 'medium' ? 'border-amber-100 bg-amber-50/50' :
                  'border-slate-100 bg-slate-50/50'
                )}>
                  <AlertCircle size={15} className={cn(
                    'mt-0.5 flex-shrink-0',
                    task.priority === 'high' ? 'text-red-500' :
                    task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold">{task.student}</span> — {task.action}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Due: {task.dueDate}</p>
                  </div>
                  <button className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0">
                    Done
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
            <div className="space-y-3">
              {MOCK_STUDENTS.filter(s => s.leadScore === 'Hot').map(s => (
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
          </div>
        </div>
      </div>
    </div>
  )
}
