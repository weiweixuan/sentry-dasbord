import React, { useState } from 'react';
import { DiagnosticInsight, SentryIssue } from '../types';
import { Sparkles, ShieldAlert, CheckCircle2, ChevronRight, Copy, Code } from 'lucide-react';

interface DiagnosticInsightsCardProps {
  insights: DiagnosticInsight[];
  onSelectIssue: (issue: SentryIssue) => void;
}

export const DiagnosticInsightsCard: React.FC<DiagnosticInsightsCardProps> = ({
  insights,
  onSelectIssue
}) => {
  const [activeTab, setActiveTab] = useState<string>(insights[0]?.id || 'diag-amap');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeInsight = insights.find((i) => i.id === activeTab) || insights[0];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (severity: DiagnosticInsight['severity']) => {
    switch (severity) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">P0 极高严重度</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">P1 中严重度</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">P2 低风险/日志噪点</span>;
    }
  };

  // Sample code snippets for recommendations
  const getFixCodeSnippet = (id: string): string => {
    switch (id) {
      case 'diag-amap':
        return `// 高德地图销毁与方法调用的防御增强
if (mapInstance && !mapInstance.isDestroyed?.()) {
  const bounds = mapInstance.getBounds();
  if (bounds?.getNorthEast) {
    // 正常业务逻辑...
  }
}`;
      case 'diag-lodop':
        return `// Lodop 套打服务的安全包装
export function safeGetLodop() {
  try {
    const lodop = getLodop();
    if (!lodop || typeof lodop.SET_LICENSES !== 'function') {
      console.warn("Lodop 服务未就绪或控件未安装");
      return null;
    }
    return lodop;
  } catch (err) {
    return null;
  }
}`;
      case 'diag-react-depth':
        return `// 解决 Reducer 中非法分发 Action 或无限 setState
// 错误: 在 Reducer 执行内直接调用 dispatch
// 修复方案: 迁移至 useEffect 或 Promise 微任务
useEffect(() => {
  if (needUpdate) {
    dispatch({ type: 'ASYNC_SYNC_SUCCESS' });
  }
}, [needUpdate]);`;
      case 'diag-null-pointers':
        return `// 接口响应解构防御
const poisList = response?.data?.res?.pois ?? [];
poisList.map((poi) => {
  /* 安全遍历 */
});`;
      default:
        return `// Sentry 初始化忽略第三方扩展噪点
Sentry.init({
  dsn: "...",
  ignoreErrors: [
    "baiduwangpan.js",
    "zaloJSV2",
    "__kd__bridge__",
    "ResizeObserver loop limit exceeded"
  ]
});`;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              智能根因诊断与治理建议 (AI Root Cause & Solution Guide)
            </h2>
            <p className="text-xs text-slate-400">提炼出 5 大核心治理专项指南</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-purple-300 bg-purple-950/60 px-3 py-1 rounded border border-purple-800/60 self-start sm:self-auto font-mono">
          5 大专项覆盖 92.4% 报错
        </span>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {insights.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition flex items-center gap-2 cursor-pointer border ${
              activeTab === item.id
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${item.severity === 'high' ? 'bg-rose-400' : 'bg-amber-400'}`} />
            {item.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Main Diagnostic Body */}
      {activeInsight && (
        <div className="mt-4 bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
          
          {/* Top Title & Severity Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-semibold text-white">{activeInsight.title}</h3>
                {getSeverityBadge(activeInsight.severity)}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>涉及项目: <strong className="text-purple-300 font-mono">{activeInsight.affectedProjects.join(', ')}</strong></span>
                <span>•</span>
                <span>影响问题: <strong className="text-rose-400 font-mono">{activeInsight.issueCount} 项</strong></span>
                <span>•</span>
                <span>影响用户: <strong className="text-amber-300 font-mono">{activeInsight.totalUsers} 人</strong></span>
              </p>
            </div>
          </div>

          {/* Root Cause Analysis & Solution Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Root Cause Box */}
            <div className="bg-slate-900 p-3.5 rounded-lg border border-rose-900/30">
              <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                故障根因分析 (Root Cause)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeInsight.rootCause}
              </p>
            </div>

            {/* Recommendation Box */}
            <div className="bg-slate-900 p-3.5 rounded-lg border border-emerald-900/30">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                推荐修复方案 (Recommended Action)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeInsight.recommendation}
              </p>
            </div>

          </div>

          {/* Code Fix Snippet */}
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                建议修复代码参考 (Code Fix Example):
              </span>
              <button
                onClick={() => handleCopy(getFixCodeSnippet(activeInsight.id), activeInsight.id)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition flex items-center gap-1 cursor-pointer border border-slate-700"
              >
                {copiedId === activeInsight.id ? (
                  <span className="text-emerald-400 font-semibold">已复制!</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> 复制代码
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800/80 text-emerald-300 overflow-x-auto">
              <code>{getFixCodeSnippet(activeInsight.id)}</code>
            </pre>
          </div>

          {/* Related Top Issues in this Category */}
          <div>
            <span className="text-xs font-semibold text-slate-300 mb-2 block">
              专项代表性 Issue (点击可进行深度分析):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeInsight.exampleIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 hover:border-purple-500/50 cursor-pointer transition text-xs flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <p className="text-slate-200 font-medium truncate text-[11px]" title={issue.title}>
                      {issue.title}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      {issue.culprit || '匿名上下文'}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

