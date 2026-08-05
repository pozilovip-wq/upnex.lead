import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  gradient?: string
  iconBg?: string
  subtitle?: string
  loading?: boolean
  onClick?: () => void
}

export function StatCardSkeleton({ gradient }: { gradient?: string }) {
  return (
    <div className={cn(
      'relative rounded-2xl p-5 overflow-hidden',
      gradient || 'bg-white border border-slate-200'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className={cn('skeleton h-3 w-24 rounded-md', gradient && 'opacity-30')} />
          <div className={cn('skeleton h-7 w-16 rounded-md', gradient && 'opacity-30')} />
          <div className={cn('skeleton h-3 w-20 rounded-md', gradient && 'opacity-20')} />
        </div>
        <div className={cn('skeleton w-10 h-10 rounded-xl flex-shrink-0', gradient && 'opacity-20')} />
      </div>
    </div>
  )
}

export default function StatCard({ title, value, icon: Icon, trend, gradient, iconBg, subtitle, loading, onClick }: StatCardProps) {
  if (loading) return <StatCardSkeleton gradient={gradient} />

  const positive = (trend ?? 0) >= 0

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl p-5 overflow-hidden',
        'transition-all duration-200 ease-out',
        'hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]',
        'active:scale-[0.99] active:shadow-md',
        onClick && 'cursor-pointer',
        gradient || 'bg-white border border-slate-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-xs font-medium mb-1', gradient ? 'text-white/70' : 'text-slate-500')}>{title}</p>
          <p className={cn('text-2xl font-bold tabular-nums', gradient ? 'text-white' : 'text-slate-800')}>{value}</p>
          {subtitle && <p className={cn('text-xs mt-0.5', gradient ? 'text-white/60' : 'text-slate-400')}>{subtitle}</p>}
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', gradient ? 'text-white/80' : positive ? 'text-emerald-600' : 'text-red-500')}>
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200', iconBg || (gradient ? 'bg-white/20' : 'bg-blue-50'))}>
          <Icon size={20} className={gradient ? 'text-white' : 'text-blue-600'} />
        </div>
      </div>
    </div>
  )
}
