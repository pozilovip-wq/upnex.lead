'use client'

import Header from '@/components/layout/Header'
import { LeadsChart, CounselorChart } from '@/components/dashboard/Charts'
import { formatCurrency } from '@/lib/utils'
import { Download, TrendingUp, Users, DollarSign, Award } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Reports & Analytics" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Overview of performance metrics and conversion rates</p>
          <button className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            <Download size={15} />
            Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(237000), change: '+18%', icon: DollarSign, color: 'bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white' },
            { label: 'Total Students', value: '103', change: '+12%', icon: Users, color: 'bg-gradient-to-br from-[#059669] to-[#10b981] text-white' },
            { label: 'Conversion Rate', value: '76%', change: '+4%', icon: TrendingUp, color: 'bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white' },
            { label: 'Scholarships', value: '14', change: '+3', icon: Award, color: 'bg-gradient-to-br from-[#dc6b19] to-[#f59e0b] text-white' },
          ].map(({ label, value, change, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl p-5 ${color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs opacity-75 mb-1">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs opacity-80 mt-1">{change} this month</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadsChart />
          <CounselorChart />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Student Pipeline Funnel</h3>
          <div className="space-y-2">
            {[
              { stage: 'New Leads', count: 110, max: 110 },
              { stage: 'Contacted', count: 89, max: 110 },
              { stage: 'Consultation', count: 67, max: 110 },
              { stage: 'Documents', count: 52, max: 110 },
              { stage: 'Applied', count: 41, max: 110 },
              { stage: 'Admitted', count: 35, max: 110 },
              { stage: 'Visa Process', count: 28, max: 110 },
              { stage: 'Visa Approved', count: 24, max: 110 },
              { stage: 'Enrolled', count: 21, max: 110 },
            ].map(({ stage, count, max }) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-28 text-xs text-slate-500 text-right">{stage}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${(count / max) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold">{count}</span>
                  </div>
                </div>
                <div className="w-12 text-xs text-slate-400 text-right">{Math.round((count / max) * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
