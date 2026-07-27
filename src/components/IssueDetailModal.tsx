import React from 'react';
import { SentryIssue } from '../types';
import { CATEGORY_COLORS } from '../utils/sentryUtils';
import { X, ExternalLink, Users, Flame, Clock, ShieldCheck } from 'lucide-react';

interface IssueDetailModalProps {
  issue: SentryIssue | null;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, onClose }) => {
  if (!issue) return null;

  const categoryColor = CATEGORY_COLORS[issue.category || 'Unknown/Other'] || '#A855F7';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-xs px-2.5 py-1 bg-slate-800 text-purple-300 font-bold rounded border border-slate-700">
            Issue #{issue.id}
          </span>

          <span
            className="text-xs px-2.5 py-1 rounded font-semibold text-white uppercase font-mono"
            style={{ backgroundColor: `${categoryColor}20`, border: `1px solid ${categoryColor}35`, color: categoryColor }}
          >
            {issue.category}
          </span>

          <span className="text-xs px-2.5 py-1 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            端: {issue.project}
          </span>

          <span className="text-xs px-2.5 py-1 rounded font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Status: {issue.status}
          </span>
        </div>

        {/* Title & Culprit */}
        <h2 className="text-lg font-bold text-white mb-2 leading-snug">
          {issue.title}
        </h2>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 mb-6 break-all">
          <span className="text-slate-500 mr-2">Culprit (触发代码文件/函数):</span>
          {issue.culprit || '未知脚本/匿名环境'}
        </div>

        {/* Impact Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
              <Users className="w-3.5 h-3.5 text-rose-400" /> 受影响用户数
            </span>
            <p className="text-xl font-bold text-rose-400 font-mono">
              {issue.userCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">人</span>
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> 触发总次数
            </span>
            <p className="text-xl font-bold text-amber-400 font-mono">
              {(issue.parsedEventCount || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">次</span>
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> 人均频次 (Ratio)
            </span>
            <p className="text-xl font-bold text-purple-300 font-mono">
              {issue.userImpactRatio || 1} <span className="text-xs font-normal text-slate-400">次/人</span>
            </p>
          </div>

        </div>

        {/* Timeline Metadata */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-6 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
          <div>
            <span className="text-slate-500">首次捕获时间 (First Seen):</span>
            <p className="text-slate-200 mt-0.5">{issue.firstSeen ? issue.firstSeen.replace('T', ' ').substring(0, 19) : '未知'}</p>
          </div>
          <div>
            <span className="text-slate-500">最近活跃时间 (Last Seen):</span>
            <p className="text-slate-200 mt-0.5">{issue.lastSeen ? issue.lastSeen.replace('T', ' ').substring(0, 19) : '未知'}</p>
          </div>
        </div>

        {/* Diagnostic Fix Recommendation */}
        <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 mb-6 space-y-3">
          <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            专属排查与修复指南 (Diagnostic Guide)
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {issue.category === 'Map SDK (Amap)' && '此错误发生在高德地图 SDK 挂载或异步轨迹绘制期间。请在涉及地图 Canvas 渲染或 Location 工具类 (AddrSug/loca/maps) 的组件中，检查 unmount 生命周期的销毁防抖与非空判断。'}
            {issue.category === 'Print SDK (Lodop)' && '此错误发生在 Lodop 客户端打印机套件调用阶段。请确认 getLodop() 返回了合法的打印机驱动句柄，且用户设备已启动 CLodop 服务，避免在驱动对象为 undefined 时强行调用 SET_LICENSES 或 GET_PRINTER_COUNT。'}
            {issue.category === 'React/State' && '此错误属于 React 生命周期或 Redux 中间件中的状态更新死循环或非法 dispatch。重点排查 orderEditor/jmInfo/middleware 与 BaseInput/ScrollableTabBarMixin 中的 setState 触发场景。'}
            {issue.category === 'TypeError' && '此错误为前端常见的 JS 运行期空指针。请确认接口/变量在未赋值、或者返回 null 时，使用了可选链 (`?.`) 或默认空对象防御。'}
            {issue.category === 'Extension/ThirdParty' && '此错误起源于 Chrome 浏览器插件（如百度网盘插件、Zalo等第三方拓展）。推荐在 Sentry SDK 初始化中设置 ignoreErrors 清单将其过滤。'}
            {issue.category === 'Network/API' && '此错误属于网络请求失败、CORS 拦截或网络中断。建议检查 API 代理服务器、TLS 证书配置，并对关键 Fetch API 增加网络重试与友好的 Toast 弹窗提示。'}
            {!['Map SDK (Amap)', 'Print SDK (Lodop)', 'React/State', 'TypeError', 'Extension/ThirdParty', 'Network/API'].includes(issue.category || '') && '请检查相关的业务逻辑处理，确保捕获代码运行期的异常边界 (Error Boundary)。'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            关闭弹窗
          </button>

          {issue.permalink && (
            <a
              href={issue.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              前往 Sentry 控制台查看原始日志
            </a>
          )}
        </div>

      </div>
    </div>
  );
};

