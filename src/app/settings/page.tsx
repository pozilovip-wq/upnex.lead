'use client'

import Header from '@/components/layout/Header'
import { User, Bell, Lock, Palette, Globe, Key } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Settings" />

      <div className="p-6 max-w-2xl space-y-5">
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

        {/* API Keys */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={16} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">API Configuration</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'OpenAI API Key', placeholder: 'sk-...' },
              { label: 'Supabase URL', placeholder: 'https://xxx.supabase.co' },
              { label: 'Supabase Anon Key', placeholder: 'eyJ...' },
            ].map(field => (
              <div key={field.label}>
                <label className="text-xs text-slate-400 mb-1 block">{field.label}</label>
                <input
                  type="password"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Save API Keys
          </button>
        </div>
      </div>
    </div>
  )
}
