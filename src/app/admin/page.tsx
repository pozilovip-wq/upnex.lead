'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { MOCK_COUNSELORS } from '@/lib/data'
import { getInitials } from '@/lib/utils'
import { Plus, Shield, Settings, Users, BarChart3, Trash2, Edit } from 'lucide-react'

const PERMISSIONS = [
  { label: 'View All Students', admin: true, manager: true, counselor: false },
  { label: 'Edit Student Profiles', admin: true, manager: true, counselor: true },
  { label: 'Delete Students', admin: true, manager: false, counselor: false },
  { label: 'Manage Employees', admin: true, manager: false, counselor: false },
  { label: 'View Reports', admin: true, manager: true, counselor: false },
  { label: 'Export Data', admin: true, manager: true, counselor: false },
  { label: 'Configure AI', admin: true, manager: false, counselor: false },
  { label: 'Manage Permissions', admin: true, manager: false, counselor: false },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'permissions' | 'ai'>('employees')

  return (
    <div className="animate-fade-in">
      <Header title="Admin Panel" />

      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'permissions', label: 'Permissions', icon: Shield },
            { id: 'ai', label: 'AI Config', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'employees' | 'permissions' | 'ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                <Plus size={15} />
                Add Employee
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Employee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Students</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COUNSELORS.map(c => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(c.name)}
                          </div>
                          <span className="font-semibold text-slate-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{c.role}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{c.email}</td>
                      <td className="px-5 py-3 text-slate-700 font-semibold text-xs">{c.studentsAssigned}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-500">
                            <Edit size={13} />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Permission</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-blue-600">Admin</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-purple-600">Manager</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Counselor</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map(p => (
                  <tr key={p.label} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-700 font-medium">{p.label}</td>
                    {([p.admin, p.manager, p.counselor] as boolean[]).map((has, i) => (
                      <td key={i} className="px-5 py-3 text-center">
                        <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${has ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                          {has ? '✓' : '✗'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4 max-w-xl">
            {[
              { label: 'Auto Lead Scoring', desc: 'AI automatically scores leads as Hot, Warm, or Cold', enabled: true },
              { label: 'Daily Task Generation', desc: 'Generate personalized task list every morning at 8 AM', enabled: true },
              { label: 'Follow-up Reminders', desc: 'Auto-remind counselors for overdue follow-ups', enabled: true },
              { label: 'University Recommendations', desc: 'Suggest universities based on student profile', enabled: true },
              { label: 'Inactive Lead Detection', desc: 'Alert when a lead has no contact for 7+ days', enabled: false },
              { label: 'Conversation Summarization', desc: 'Auto-summarize call notes using AI', enabled: false },
            ].map(setting => (
              <div key={setting.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{setting.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{setting.desc}</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${setting.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow mt-1 transition-transform ${setting.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
