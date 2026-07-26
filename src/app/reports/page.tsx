'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { LeadsChart, CounselorChart } from '@/components/dashboard/Charts'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { Download, TrendingUp, Users, DollarSign, Award, Loader2 } from 'lucide-react'

interface ReportStats {
  totalRevenue: number
  totalStudents: number
  admitted: number
  scholarships: number
}

export default function ReportsPage() {
  const { students } = useStore()
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalStudents: 0,
    admitted: 0,
    scholarships: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: payments }, { count: studentCount }] = await Promise.all([
        supabase.from('payments').select('amount'),
        supabase.from('students').select('*', { count: 'exact', head: true }),
      ])

      const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
      const admitted = students.filter(s =>
        ['Admission Received', 'Scholarship Awarded', 'Visa Preparation', 'Visa Interview', 'Visa Approved', 'Travel Completed'].includes(s.status)
      ).length
      const scholarships = students.filter(s => s.status === 'Scholarship Awarded').length

      setStats({
        totalRevenue,
        totalStudents: studentCount ?? students.length,
        admitted,
        scholarships,
      })
      setLoading(false)
    }

    if (students.length > 0 || !loading) load()
  }, [students]) // eslint-disable-line react-hooks/exhaustive-deps

  const conversionRate = stats.totalStudents > 0
    ? Math.round((stats.admitted / stats.totalStudents) * 100)
    : 0

  // Pipeline funnel from real students
  const stageOrder = [
    'New Lead', 'Contacted', 'Consultation Scheduled', 'Documents Requested',
    'Documents Received', 'University Applied', 'Admission Received',
    'Scholarship Awarded', 'Visa Preparation', 'Visa Interview',
    'Visa Approved', 'Travel Completed',
  ]
  const stageCounts = stageOrder.map(stage => ({
    stage,
    count: students.filter(s => s.status === stage).length,
  }))
  const maxCount = Math.max(...stageCounts.map(s => s.count), 1)

  const exportCSV = () => {
    if (students.length === 0) return
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Lead Score', 'Country', 'Major', 'GPA', 'IELTS', 'Budget', 'Counselor', 'Created At']
    const rows = students.map(s => [
      s.name, s.email, s.phone, s.status, s.leadScore,
      s.preferredCountry, s.major, s.gpa, s.ielts, s.budget,
      s.counselor, s.createdAt,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `upnex-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <Header title="Reports & Analytics" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Overview of performance metrics and conversion rates</p>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-4 flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {[
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), change: 'All time', icon: DollarSign, color: 'bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white' },
                { label: 'Total Students', value: String(stats.totalStudents), change: 'All time', icon: Users, color: 'bg-gradient-to-br from-[#059669] to-[#10b981] text-white' },
                { label: 'Conversion Rate', value: `${conversionRate}%`, change: 'Leads → Admitted', icon: TrendingUp, color: 'bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white' },
                { label: 'Scholarships', value: String(stats.scholarships), change: 'Awarded', icon: Award, color: 'bg-gradient-to-br from-[#dc6b19] to-[#f59e0b] text-white' },
              ].map(({ label, value, change, icon: Icon, color }) => (
                <div key={label} className={`rounded-2xl p-5 ${color}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs opacity-75 mb-1">{label}</p>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs opacity-80 mt-1">{change}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadsChart />
          <CounselorChart />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Student Pipeline Funnel</h3>
          <div className="space-y-2">
            {stageCounts.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-36 text-xs text-slate-500 text-right truncate">{stage}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                  </div>
                </div>
                <div className="w-8 text-xs text-slate-400 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
