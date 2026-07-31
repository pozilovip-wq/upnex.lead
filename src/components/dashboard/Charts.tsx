'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { supabase } from '@/lib/supabase'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function LeadsChart() {
  const [data, setData] = useState<{ month: string; leads: number; enrolled: number }[]>([])

  useEffect(() => {
    supabase
      .from('students')
      .select('created_at, stage')
      .then(({ data: rows }) => {
        if (!rows) return
        const now = new Date()
        const months: Record<string, { leads: number; enrolled: number }> = {}
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          months[`${d.getFullYear()}-${d.getMonth()}`] = { leads: 0, enrolled: 0 }
        }
        for (const row of rows) {
          const d = new Date(row.created_at)
          const key = `${d.getFullYear()}-${d.getMonth()}`
          if (key in months) {
            months[key].leads++
            if (['Admission Received', 'Scholarship Awarded', 'Visa Preparation', 'Visa Interview', 'Visa Approved', 'Travel Completed'].includes(row.stage)) {
              months[key].enrolled++
            }
          }
        }
        setData(
          Object.entries(months).map(([key, v]) => ({
            month: MONTHS[parseInt(key.split('-')[1])],
            ...v,
          }))
        )
      })
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-1">Monthly Leads & Enrollments</h3>
      <p className="text-xs text-slate-400 mb-4">Last 6 months performance</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
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
  const [data, setData] = useState<{ name: string; students: number; contracts: number; revenue: number }[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('employees').select('id, name'),
      supabase.from('students').select('counselor_id, counselor_name, stage'),
      supabase.from('payments').select('amount, student_id'),
    ]).then(([{ data: emps }, { data: studs }, { data: pays }]) => {
      if (!emps || !studs) return
      const rows = emps.map(e => {
        const myStudents = studs.filter(s => s.counselor_id === e.id || s.counselor_name === e.name)
        const enrolled = myStudents.filter(s =>
          ['Admission Received', 'Scholarship Awarded', 'Visa Preparation', 'Visa Interview', 'Visa Approved', 'Travel Completed'].includes(s.stage)
        ).length
        const myStudentIds = new Set(myStudents.map((_, i) => i)) // approximate
        const rev = pays
          ? pays.filter(p => myStudents.some((_, i) => i === myStudentIds.size)).reduce((a, p) => a + Number(p.amount), 0)
          : 0
        return {
          name: e.name.split(' ')[0],
          students: myStudents.length,
          contracts: enrolled,
          revenue: Math.round(rev / 1000),
        }
      }).filter(r => r.students > 0)
      if (rows.length > 0) setData(rows)
    })
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-1">Counselor Performance</h3>
      <p className="text-xs text-slate-400 mb-4">Students, contracts & revenue ($K)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
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
