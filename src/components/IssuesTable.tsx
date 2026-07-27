import React from 'react';
import { SentryIssue } from '../types';
import { CATEGORY_COLORS } from '../utils/sentryUtils';
import { ExternalLink, Eye, Monitor, Smartphone, AlertCircle } from 'lucide-react';

interface IssuesTableProps {
  issues: SentryIssue[];
  onSelectIssue: (issue: SentryIssue) => void;
}

export const IssuesTable: React.FC<IssuesTableProps> = ({ issues, onSelectIssue }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col mb-8">
      
      {/* Table Header Row */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-800/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            Top Trending Issues / 异常明细列表
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">点击数据行或操作按钮调起堆栈与修复建议</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>共 <strong className="text-white">{issues.length}</strong> 条记录</span>
        </div>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[11px] font-medium">
              <th className="py-2.5 px-5 font-medium">Sentry ID & 异常 Title</th>
              <th className="py-2.5 px-4 font-medium">项目端</th>
              <th className="py-2.5 px-4 font-medium">异常类别</th>
              <th className="py-2.5 px-4 font-medium text-right">受影响用户 (UV)</th>
              <th className="py-2.5 px-4 font-medium text-right">触发次数 (PV)</th>
              <th className="py-2.5 px-4 font-medium text-right">人均频率</th>
              <th className="py-2.5 px-4 font-medium text-center">最后发生</th>
              <th className="py-2.5 px-5 font-medium text-right">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 text-slate-300">
            {issues.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  无符合筛选条件的 Sentry 异常数据
                </td>
              </tr>
            ) : (
              issues.map((issue) => {
                const categoryColor = CATEGORY_COLORS[issue.category || 'Unknown/Other'] || '#64748B';
                const isWeb = issue.project === 'cmm-sass-web';

                return (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* ID & Title */}
                    <td className="py-3 px-5 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/80 font-semibold">
                          #{issue.id}
                        </span>
                        <p className="font-medium text-white group-hover:text-purple-300 transition truncate" title={issue.title}>
                          {issue.title}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5" title={issue.culprit || ''}>
                        {issue.culprit || '未知触发源 (Unknown Culprit)'}
                      </p>
                    </td>

                    {/* Project */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isWeb ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          <Monitor className="w-3 h-3" /> Web
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <Smartphone className="w-3 h-3" /> Mobile
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                        style={{ backgroundColor: `${categoryColor}20`, border: `1px solid ${categoryColor}35`, color: categoryColor }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
                        {issue.category}
                      </span>
                    </td>

                    {/* Affected Users */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold text-rose-400">
                      {issue.userCount.toLocaleString()}
                    </td>

                    {/* Event Count */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-amber-300">
                      {(issue.parsedEventCount || 0).toLocaleString()}
                    </td>

                    {/* User Impact Ratio */}
                    <td className="py-3 px-4 text-right whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {issue.userImpactRatio || 1} 次/人
                    </td>

                    {/* Last Seen */}
                    <td className="py-3 px-4 text-center whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {issue.lastSeen ? issue.lastSeen.replace('T', ' ').substring(0, 16) : '未知'}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition cursor-pointer"
                          title="查看诊断指导"
                        >
                          <Eye className="w-4 h-4 text-purple-400" />
                        </button>
                        {issue.permalink && (
                          <a
                            href={issue.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition cursor-pointer"
                            title="打开 Sentry 控制台"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

