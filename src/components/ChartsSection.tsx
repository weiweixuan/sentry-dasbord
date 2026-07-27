import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { SentryIssue, CategorySummary, CulpritModuleSummary } from '../types';
import { CATEGORY_COLORS } from '../utils/sentryUtils';
import { BarChart2, PieChart as PieIcon, Flame, Users, AlertCircle, Layers } from 'lucide-react';

interface ChartsSectionProps {
  issues: SentryIssue[];
  categorySummaries: CategorySummary[];
  culpritSummaries: CulpritModuleSummary[];
  selectedProject: string;
  onSelectIssue: (issue: SentryIssue) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  issues,
  categorySummaries,
  culpritSummaries,
  selectedProject,
  onSelectIssue
}) => {
  const [categoryChartMode, setCategoryChartMode] = useState<'bar' | 'pie'>('bar');

  // Top 8 issues by user count
  const topUsersIssues = [...issues]
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 8)
    .map((issue) => {
      let shortTitle = issue.title.replace('TypeError: ', '').replace('ReferenceError: ', '').replace('Error: ', '');
      if (shortTitle.length > 25) shortTitle = shortTitle.substring(0, 25) + '...';
      return {
        id: issue.id,
        title: shortTitle,
        fullTitle: issue.title,
        userCount: issue.userCount,
        eventCount: issue.parsedEventCount || 0,
        culprit: issue.culprit || '未知出处',
        rawIssue: issue
      };
    });

  // Top 8 issues by event count
  const topEventsIssues = [...issues]
    .sort((a, b) => (b.parsedEventCount || 0) - (a.parsedEventCount || 0))
    .slice(0, 8)
    .map((issue) => {
      let shortTitle = issue.title.replace('TypeError: ', '').replace('ReferenceError: ', '').replace('Error: ', '');
      if (shortTitle.length > 25) shortTitle = shortTitle.substring(0, 25) + '...';
      return {
        id: issue.id,
        title: shortTitle,
        fullTitle: issue.title,
        eventCount: issue.parsedEventCount || 0,
        userCount: issue.userCount,
        culprit: issue.culprit || '未知出处',
        rawIssue: issue
      };
    });

  return (
    <div className="space-y-6 mb-8">
      
      {/* SECTION 1: Category Distribution & Top Users Affected */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (5 columns) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                异常分类归因 (Error Categories)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">按影响用户数 (UV) 维度统计分布</p>
            </div>
            <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
              <button
                onClick={() => setCategoryChartMode('bar')}
                className={`p-1 rounded transition ${
                  categoryChartMode === 'bar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="柱状图"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCategoryChartMode('pie')}
                className={`p-1 rounded transition ${
                  categoryChartMode === 'pie' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="饼图"
              >
                <PieIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {categoryChartMode === 'bar' ? (
                <BarChart data={categorySummaries} layout="vertical" margin={{ left: 10, right: 15, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="category" stroke="#94A3B8" fontSize={11} width={110} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                    wrapperStyle={{ zIndex: 1000 }}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', color: '#FFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: '600', marginBottom: '4px' }}
                    formatter={(value: any) => [`${value} 人`, '影响用户']}
                  />
                  <Bar dataKey="userCount" radius={[0, 4, 4, 0]}>
                    {categorySummaries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#A855F7'} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={categorySummaries}
                    dataKey="userCount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categorySummaries.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#A855F7'} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 1000 }}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', color: '#FFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: '600', marginBottom: '4px' }}
                    formatter={(value: any, name: any) => [`${value} 人`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Quick Legend Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800 text-[11px]">
            {categorySummaries.slice(0, 5).map((cat) => (
              <span key={cat.category} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#A855F7' }} />
                {cat.category}: <strong className="text-white font-mono">{cat.userCount}人</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Top Users Affected (7 columns) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                TOP 8 受影响最严重异常 (Most Affected Users)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">点击柱状图条目可立即弹框查看堆栈根因与修复指引</p>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-semibold uppercase">
              UV 维度
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topUsersIssues} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="title"
                  stroke="#64748B"
                  fontSize={10}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                  wrapperStyle={{ zIndex: 1000 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-3 max-w-xs text-xs space-y-1.5 z-50 pointer-events-none">
                          <p className="font-bold text-rose-400 leading-snug">{data.fullTitle}</p>
                          <p className="text-slate-300">出处: <code className="text-purple-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{data.culprit}</code></p>
                          <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-slate-800 font-semibold font-mono">
                            <span className="text-slate-300">受影响用户: <strong className="text-rose-400">{data.userCount} 人</strong></span>
                            <span className="text-slate-300">触发次数: <strong className="text-amber-400">{data.eventCount} 次</strong></span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="userCount"
                  fill="#F43F5E"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(entry) => entry && entry.rawIssue && onSelectIssue(entry.rawIssue)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 2: Top Event Count Generators & Module Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Event Count Generators (6 columns) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                高频刷屏异常 Top 8 (Highest Event Frequency)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">极其高频的异常，通常伴随死循环或未防抖重试</p>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold uppercase">
              Events 维度
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEventsIssues} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="title"
                  stroke="#64748B"
                  fontSize={10}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                  wrapperStyle={{ zIndex: 1000 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-3 max-w-xs text-xs space-y-1.5 z-50 pointer-events-none">
                          <p className="font-bold text-amber-400 leading-snug">{data.fullTitle}</p>
                          <p className="text-slate-300">出处: <code className="text-purple-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{data.culprit}</code></p>
                          <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-slate-800 font-semibold font-mono">
                            <span className="text-slate-300">触发总次数: <strong className="text-amber-400">{data.eventCount} 次</strong></span>
                            <span className="text-slate-300">受影响用户: <strong className="text-rose-400">{data.userCount} 人</strong></span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="eventCount"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(entry) => entry && entry.rawIssue && onSelectIssue(entry.rawIssue)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Culprit Modules Summary List (6 columns) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400" />
                代码业务模块故障排行 (Module Culprit Ranking)
              </h3>
              <span className="text-xs text-slate-400">聚合 Top 6 风险模块</span>
            </div>

            <div className="space-y-2.5 mt-2">
              {culpritSummaries.slice(0, 6).map((item, idx) => {
                const maxUsers = culpritSummaries[0]?.userCount || 1;
                const percentage = Math.min(100, Math.round((item.userCount / maxUsers) * 100));

                return (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-200 truncate max-w-[220px]" title={item.moduleName}>
                        {idx + 1}. {item.moduleName}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-rose-400 font-semibold">{item.userCount} 人受影响</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-300">{item.eventCount} 次触发</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>地图 (Amap) 与 Lodop 打印套件为最显著端侧依赖隐患源</span>
            <span className="text-purple-400 font-medium">推荐优先治理</span>
          </p>
        </div>

      </div>

    </div>
  );
};

