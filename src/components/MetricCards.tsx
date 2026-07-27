import React from 'react';
import { Users, AlertTriangle, Flame, Monitor, Smartphone, Zap } from 'lucide-react';

interface MetricCardsProps {
  totalIssues: number;
  totalUsers: number;
  totalEvents: number;
  webIssueCount: number;
  mobileIssueCount: number;
  criticalIssuesCount: number;
  avgEventsPerUser: number;
  selectedProject: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalIssues,
  totalUsers,
  totalEvents,
  webIssueCount,
  mobileIssueCount,
  criticalIssuesCount,
  avgEventsPerUser,
  selectedProject
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Users Impacted */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">受影响总用户数</span>
          <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">
              {totalUsers.toLocaleString()}
            </span>
            <span className="text-rose-400 text-xs mb-1 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              UV 独立用户
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>人均触发频次:</span>
            <strong className="text-slate-200 font-mono">{avgEventsPerUser} 次/人</strong>
          </p>
        </div>
      </div>

      {/* Total Events Triggered */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">异常触发总次数</span>
          <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">
              {totalEvents.toLocaleString()}
            </span>
            <span className="text-amber-400 text-xs mb-1 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Events
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 pt-2 border-t border-slate-800/60">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            包含重试与重复事件抛错
          </p>
        </div>
      </div>

      {/* Unresolved Issues & Severity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">未解决 Issue 种数</span>
          <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">
              {totalIssues}
            </span>
            <span className="text-purple-400 text-xs mb-1 font-medium bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
              规则配置
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>高优先级 (&gt;100人受影响):</span>
            <span className="text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              {criticalIssuesCount} 项
            </span>
          </p>
        </div>
      </div>

      {/* Web vs Mobile Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">双端分布 (Web vs Mobile)</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Monitor className="w-3.5 h-3.5 text-purple-400" />
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-300 flex items-center gap-1 font-medium">
              <Monitor className="w-3 h-3" /> cmm-sass-web:
            </span>
            <span className="font-bold text-white font-mono">{webIssueCount} 项</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-purple-500 h-full transition-all duration-500" 
              style={{ width: `${(webIssueCount / Math.max(totalIssues, 1)) * 100}%` }} 
            />
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${(mobileIssueCount / Math.max(totalIssues, 1)) * 100}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-300 flex items-center gap-1 font-medium">
              <Smartphone className="w-3 h-3" /> cmm-mobile-end:
            </span>
            <span className="font-bold text-white font-mono">{mobileIssueCount} 项</span>
          </div>
        </div>
      </div>

    </div>
  );
};

