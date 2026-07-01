'use client'

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MONTHLY_LEADS, COUNSELOR_PERFORMANCE } from '@/lib/data'

export function LeadsChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-1">Monthly Leads & Enrollments</h3>
      <p className="text-xs text-slate-400 mb-4">Last 6 months performance</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={MONTHLY_LEADS} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="leads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="enrolled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={2} fill="url(#leads)" name="Leads" />
          <Area type="monotone" dataKey="enrolled" stroke="#10b981" strokeWidth={2} fill="url(#enrolled)" name="Enrolled" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CounselorChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-1">Counselor Performance</h3>
      <p className="text-xs text-slate-400 mb-4">Students, contracts & revenue ($K)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={COUNSELOR_PERFORMANCE} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} name="Students" />
          <Bar dataKey="contracts" fill="#10b981" radius={[4, 4, 0, 0]} name="Contracts" />
          <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Revenue ($K)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
