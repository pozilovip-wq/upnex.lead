'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'
import { Plus, Shield, Settings, Users, Trash2, Edit, X, Check, Loader2, AlertCircle } from 'lucide-react'

interface Employee {
  id: string
  user_id: string | null
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Counselor'
  phone: string
  created_at: string
}

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

interface EmployeeFormData {
  name: string
  email: string
  password: string
  role: 'Admin' | 'Manager' | 'Counselor'
  phone: string
}

function EmployeeModal({
  employee,
  onClose,
  onSaved,
}: {
  employee?: Employee
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(employee)
  const [form, setForm] = useState<EmployeeFormData>({
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    password: '',
    role: employee?.role ?? 'Counselor',
    phone: employee?.phone ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isEdit && employee) {
      // Update existing employee
      const { error: updateError } = await supabase
        .from('employees')
        .update({ name: form.name, role: form.role, phone: form.phone })
        .eq('id', employee.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      // Create new user via API route (needs service role)
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to create user')
        setLoading(false)
        return
      }
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Email *</label>
              <input
                required
                type="email"
                disabled={isEdit}
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>
            {!isEdit && (
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Password *</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Role *</label>
              <select
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value as EmployeeFormData['role'] }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Counselor</option>
                <option>Manager</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'permissions' | 'ai'>('employees')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | undefined>()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true)
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true })
    setEmployees((data as Employee[]) ?? [])
    setLoadingEmployees(false)
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleDelete = async (emp: Employee) => {
    await fetch('/api/admin/create-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: emp.id, userId: emp.user_id }),
    })
    fetchEmployees()
    setConfirmDelete(null)
  }

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
              <button
                onClick={() => { setEditEmployee(undefined); setShowModal(true) }}
                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus size={15} />
                Add Employee
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {loadingEmployees ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Employee</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Role</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Email</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">No employees yet.</td>
                      </tr>
                    )}
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(emp.name)}
                            </div>
                            <span className="font-semibold text-slate-800">{emp.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{emp.role}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{emp.email}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {confirmDelete === emp.id ? (
                              <>
                                <button
                                  onClick={() => handleDelete(emp)}
                                  className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-lg"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditEmployee(emp); setShowModal(true) }}
                                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-500"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(emp.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-400"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

      {showModal && (
        <EmployeeModal
          employee={editEmployee}
          onClose={() => setShowModal(false)}
          onSaved={fetchEmployees}
        />
      )}
    </div>
  )
}
