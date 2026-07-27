import React from 'react';
import { Search, Filter, Monitor, Smartphone, Layers, ArrowUpDown } from 'lucide-react';
import { FilterState, ErrorCategory } from '../types';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  categories: ErrorCategory[];
  totalFilteredCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  categories,
  totalFilteredCount
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 space-y-4">
      
      {/* Top Row: Project Tab Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Project Selector Tabs */}
        <div className="inline-flex bg-slate-950 p-1 rounded-md border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => onFilterChange({ project: 'all' })}
            className={`px-3 py-1 text-xs font-medium rounded transition flex items-center gap-1.5 cursor-pointer ${
              filters.project === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            全部端 (Web + Mobile)
          </button>

          <button
            onClick={() => onFilterChange({ project: 'cmm-sass-web' })}
            className={`px-3 py-1 text-xs font-medium rounded transition flex items-center gap-1.5 cursor-pointer ${
              filters.project === 'cmm-sass-web'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-purple-300" />
            Web 端 (cmm-sass-web)
          </button>

          <button
            onClick={() => onFilterChange({ project: 'cmm-mobile-end' })}
            className={`px-3 py-1 text-xs font-medium rounded transition flex items-center gap-1.5 cursor-pointer ${
              filters.project === 'cmm-mobile-end'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
            移动端 (cmm-mobile-end)
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索异常 Title、Culprit 路径或 Sentry ID..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Bottom Row: Detailed Dropdown Filters & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-purple-400" /> 异常类别:
            </span>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">全部分类 ({categories.length} 类)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Recency Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">时效状态:</span>
            <select
              value={filters.recency}
              onChange={(e) => onFilterChange({ recency: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">全部时间段</option>
              <option value="critical">最近 6 小时内活跃 (Critical)</option>
              <option value="recent">最近 3 天内活跃 (Recent)</option>
              <option value="longstanding">历史未解决存量 (Longstanding)</option>
            </select>
          </div>

          {/* Min Users Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">受影响用户 ≥</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={filters.minUsers || ''}
              onChange={(e) => onFilterChange({ minUsers: parseInt(e.target.value, 10) || 0 })}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500 text-center font-mono"
            />
            <span className="text-slate-500">人</span>
          </div>
        </div>

        {/* Sorting & Filtered Count Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 font-medium">排序依据:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="userCount">受影响用户数 (UV)</option>
              <option value="eventCount">触发总次数 (Events)</option>
              <option value="userImpactRatio">人均触发频率 (Ratio)</option>
              <option value="lastSeen">最近发生时间 (Last Seen)</option>
            </select>
          </div>

          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded font-semibold text-[11px] border border-slate-700/60 font-mono">
            找到 <strong className="text-purple-400">{totalFilteredCount}</strong> 条匹配记录
          </span>
        </div>

      </div>

    </div>
  );
};

