'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { User, Bell, Key, Check } from 'lucide-react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setApiKey(localStorage.getItem('openai_key') || '')
  }, [])

  const saveKey = () => {
    localStorage.setItem('openai_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="animate-fade-in">
      <Header title="Settings" />

      <div className="p-6 max-w-2xl space-y-5">
        {/* AI Config — most important */}
        <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1e3a8a] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Key size={16} className="text-blue-300" />
            <h3 className="font-semibold text-white">AI Configuration</h3>
          </div>
          <p className="text-blue-200 text-xs mb-4">
            Required to enable AI lead analysis, email generation, and sales coaching.
            Get your key at <span className="text-white font-medium">platform.openai.com</span>
          </p>
          <label className="text-xs text-blue-300 mb-1.5 block">OpenAI API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-blue-300/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 font-mono"
            />
            <button
              onClick={saveKey}
              className="flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              {saved ? <><Check size={15} className="text-emerald-600" /> Saved!</> : 'Save Key'}
            </button>
          </div>
          {apiKey && (
            <p className="text-emerald-300 text-xs mt-2 flex items-center gap-1">
              <Check size={11} /> Key saved — AI features are now active
            </p>
          )}
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">Profile Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: 'Admin User', type: 'text' },
              { label: 'Email', value: 'admin@upnex.ai', type: 'email' },
              { label: 'Phone', value: '+998 90 000 0000', type: 'tel' },
              { label: 'Role', value: 'Administrator', type: 'text' },
            ].map(field => (
              <div key={field.label}>
                <label className="text-xs text-slate-400 mb-1 block">{field.label}</label>
                <input
                  defaultValue={field.value}
                  type={field.type}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              'Student replies to messages',
              'Follow-up overdue alerts',
              'University deadline reminders',
              'Document missing notifications',
              'Visa appointment updates',
              'AI daily briefing at 8 AM',
            ].map(item => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item}</span>
                <div className="w-10 h-6 rounded-full bg-blue-600 cursor-pointer flex items-center">
                  <div className="w-4 h-4 bg-white rounded-full shadow translate-x-5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Data Management</h3>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (confirm('Reset all data to demo data? This cannot be undone.')) {
                  localStorage.removeItem('upnex_students')
                  localStorage.removeItem('upnex_tasks')
                  window.location.reload()
                }
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              Reset Demo Data
            </button>
            <button
              onClick={() => {
                const students = localStorage.getItem('upnex_students')
                if (!students) return
                const blob = new Blob([students], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `upnex-students-${new Date().toISOString().slice(0,10)}.json`
                a.click()
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Export Students (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
