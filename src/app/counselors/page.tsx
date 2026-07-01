'use client'

import Header from '@/components/layout/Header'
import { MOCK_COUNSELORS } from '@/lib/data'
import { formatCurrency, getInitials } from '@/lib/utils'
import { Users, Phone, FileText, DollarSign, TrendingUp } from 'lucide-react'

export default function CounselorsPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Counselors" />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {MOCK_COUNSELORS.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {getInitials(c.name)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
                  <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {c.role}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: Users, label: 'Students', value: c.studentsAssigned, color: 'text-blue-600' },
                  { icon: Phone, label: 'Calls', value: c.callsCompleted, color: 'text-purple-600' },
                  { icon: FileText, label: 'Contracts', value: c.contractsSigned, color: 'text-emerald-600' },
                  { icon: TrendingUp, label: 'Conv. Rate', value: `${c.conversionRate}%`, color: 'text-amber-600' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={12} className={color} />
                      <span className="text-[10px] text-slate-400">{label}</span>
                    </div>
                    <p className={`text-sm font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1e40af] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-blue-200" />
                  <span className="text-xs text-blue-200">Revenue</span>
                </div>
                <span className="text-white font-bold text-sm">{formatCurrency(c.revenue)}</span>
              </div>

              {/* Performance Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Performance</span>
                  <span>{c.conversionRate}%</span>
                </div>
                <div className="bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${c.conversionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Performance Leaderboard</h3>
          <div className="space-y-3">
            {[...MOCK_COUNSELORS].sort((a, b) => b.revenue - a.revenue).map((c, i) => (
              <div key={c.id} className="flex items-center gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                    <span className="text-sm font-bold text-blue-600">{formatCurrency(c.revenue)}</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${(c.revenue / 84000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
