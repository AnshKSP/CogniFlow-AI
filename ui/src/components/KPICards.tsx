import { ArrowUpRight, ArrowDownRight, MessageSquare, FileText, Video, BrainCircuit } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
  color: string
}

function KPICard({ title, value, change, trend, icon, color }: KPICardProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-900/30 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-blue-300/60 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {change}
            <span className="text-blue-300/40 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Conversations"
        value="12,847"
        change="+23.5%"
        trend="up"
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <KPICard
        title="Documents Analyzed"
        value="3,429"
        change="+12.3%"
        trend="up"
        icon={<FileText className="w-6 h-6 text-white" />}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
      />
      <KPICard
        title="Videos Processed"
        value="1,284"
        change="+8.7%"
        trend="up"
        icon={<Video className="w-6 h-6 text-white" />}
        color="bg-gradient-to-br from-cyan-500 to-cyan-600"
      />
      <KPICard
        title="AI Accuracy Score"
        value="94.7%"
        change="-2.1%"
        trend="down"
        icon={<BrainCircuit className="w-6 h-6 text-white" />}
        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
      />
    </div>
  )
}