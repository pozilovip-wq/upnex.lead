'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, GitBranch, Calendar, MessageSquare,
  FolderOpen, Settings, Bell, ChevronLeft, ChevronRight,
  Brain, CheckSquare, BarChart3, UserCheck, Shield, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NOTIFICATIONS } from '@/lib/data'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { href: '/tasks', label: 'AI Tasks', icon: Brain },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/counselors', label: 'Counselors', icon: UserCheck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin', label: 'Admin', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  return (
    <aside className={cn(
      'sidebar-gradient flex flex-col h-screen sticky top-0 transition-all duration-300 z-40',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm tracking-wide">Upnex AI</div>
            <div className="text-blue-300 text-[10px] font-medium tracking-wider uppercase">CRM</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 mx-2 mb-0.5 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="text-[13px] font-medium">{label}</span>}
              {label === 'Messages' && unread > 0 && !collapsed && (
                <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">Admin User</div>
              <div className="text-slate-400 text-[10px]">Administrator</div>
            </div>
            <Bell size={14} className="text-slate-400 flex-shrink-0" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
