'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { supabase } from '@/lib/supabase'
import { User, Bell, Key, Check, LogOut, Loader2 } from 'lucide-react'

interface Profile {
  name: string
  email: string
  phone: string
  role: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [keySaved, setKeySaved] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', phone: '', role: '' })
  const [profileSaved, setProfileSaved] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Load current user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: emp } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (emp) {
          setEmployeeId(emp.id)
          setProfile({ name: emp.name, email: emp.email, phone: emp.phone ?? '', role: emp.role })
        }
      }

      // Load OpenAI key indicator (don't expose the value, just check existence)
      const res = await fetch('/api/settings/save-key?key=openai_api_key')
      const json = await res.json()
      if (json.value) setApiKey(json.value)
    }

    load()
  }, [])

  const saveKey = async () => {
    setSavingKey(true)
    await fetch('/api/settings/save-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'openai_api_key', value: apiKey }),
    })
    setSavingKey(false)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const saveProfile = async () => {
    if (!employeeId) return
    setSavingProfile(true)
    await supabase
      .from('employees')
      .update({ name: profile.name, phone: profile.phone })
      .eq('id', employeeId)
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="animate-fade-in">
      <Header title="Settings" />

      <div className="p-6 max-w-2xl space-y-5">
        {/* AI Config */}
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
              disabled={savingKey}
              className="flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex-shrink-0 disabled:opacity-70"
            >
              {savingKey ? <Loader2 size={14} className="animate-spin" /> : keySaved ? <><Check size={15} className="text-emerald-600" /> Saved!</> : 'Save Key'}
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
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input
                value={profile.email}
                disabled
                type="email"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 outline-none opacity-60"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Phone</label>
              <input
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                type="tel"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Role</label>
              <input
                value={profile.role}
                disabled
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 outline-none opacity-60"
              />
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={savingProfile || !employeeId}
            className="mt-4 flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {savingProfile ? <Loader2 size={13} className="animate-spin" /> : profileSaved ? <Check size={13} /> : null}
            {profileSaved ? 'Saved!' : 'Save Changes'}
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

        {/* Account */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Account</h3>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
