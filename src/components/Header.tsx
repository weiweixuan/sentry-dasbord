import React from 'react';
import { Activity, ShieldAlert, Upload, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  webRelease: string;
  mobileRelease: string;
  totalIssuesCount: number;
  onOpenUpload: () => void;
  onExportReport: () => void;
  onResetFilters: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  webRelease,
  mobileRelease,
  totalIssuesCount,
  onOpenUpload,
  onExportReport,
  onResetFilters
}) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left Title & Status Badges */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-purple-600/30 shrink-0">
            S
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Sentry Intelligence <span className="text-slate-500 font-normal">/ 异常分析看板</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {totalIssuesCount} 个未解决异常
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Web / Mobile 双端</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-300">Release: <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-purple-300 text-[11px] font-mono border border-slate-700/50">{webRelease}</code></span>
              <span className="text-slate-700">•</span>
              <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed Active
              </span>
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onResetFilters}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700/60 transition flex items-center gap-1.5 cursor-pointer"
            title="重置过滤条件"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重置筛选
          </button>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 text-xs font-medium text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 rounded-md transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            导入 Sentry JSON
          </button>

          <button
            onClick={onExportReport}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-md transition shadow-sm shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            导出摘要
          </button>
        </div>

      </div>
    </header>
  );
};

