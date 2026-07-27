import React, { useState, useMemo } from 'react';
import { SentryIssue, SentryReportData, FilterState, ErrorCategory } from './types';
import { webSentryReport, mobileSentryReport } from './data/sentryData';
import {
  processIssues,
  getCategorySummaries,
  getCulpritModuleSummaries,
  generateDiagnosticInsights,
  parseNum
} from './utils/sentryUtils';

import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FilterToolbar } from './components/FilterToolbar';
import { ChartsSection } from './components/ChartsSection';
import { DiagnosticInsightsCard } from './components/DiagnosticInsightsCard';
import { IssuesTable } from './components/IssuesTable';
import { IssueDetailModal } from './components/IssueDetailModal';
import { CustomJsonUploadModal } from './components/CustomJsonUploadModal';

export default function App() {
  // Initial Datasets from Sentry Reports
  const initialWebIssues = useMemo(() => processIssues(webSentryReport.issues, 'cmm-sass-web'), []);
  const initialMobileIssues = useMemo(() => processIssues(mobileSentryReport.issues, 'cmm-mobile-end'), []);

  const [issuesData, setIssuesData] = useState<SentryIssue[]>(() => [...initialWebIssues, ...initialMobileIssues]);
  const [selectedIssue, setSelectedIssue] = useState<SentryIssue | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    project: 'all',
    category: 'all',
    search: '',
    minUsers: 0,
    recency: 'all',
    sortBy: 'userCount',
    sortOrder: 'desc'
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      project: 'all',
      category: 'all',
      search: '',
      minUsers: 0,
      recency: 'all',
      sortBy: 'userCount',
      sortOrder: 'desc'
    });
  };

  // Filtered Issues Calculation
  const filteredIssues = useMemo(() => {
    return issuesData
      .filter((issue) => {
        // Project Filter
        if (filters.project !== 'all' && issue.project !== filters.project) {
          return false;
        }

        // Category Filter
        if (filters.category !== 'all' && issue.category !== filters.category) {
          return false;
        }

        // Min Users Filter
        if (filters.minUsers > 0 && issue.userCount < filters.minUsers) {
          return false;
        }

        // Recency Filter
        if (filters.recency !== 'all' && issue.recencyStatus !== filters.recency) {
          return false;
        }

        // Search Filter
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchTitle = issue.title.toLowerCase().includes(query);
          const matchCulprit = (issue.culprit || '').toLowerCase().includes(query);
          const matchId = issue.id.includes(query);
          if (!matchTitle && !matchCulprit && !matchId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (filters.sortBy === 'userCount') {
          valA = a.userCount;
          valB = b.userCount;
        } else if (filters.sortBy === 'eventCount') {
          valA = a.parsedEventCount || parseNum(a.eventCount);
          valB = b.parsedEventCount || parseNum(b.eventCount);
        } else if (filters.sortBy === 'userImpactRatio') {
          valA = a.userImpactRatio || 0;
          valB = b.userImpactRatio || 0;
        } else if (filters.sortBy === 'lastSeen') {
          valA = new Date(a.lastSeen).getTime();
          valB = new Date(b.lastSeen).getTime();
        }

        return filters.sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [issuesData, filters]);

  // Derived Analytics Aggregations
  const totalIssuesCount = filteredIssues.length;
  const totalUsersAffected = useMemo(() => filteredIssues.reduce((acc, i) => acc + (i.userCount || 0), 0), [filteredIssues]);
  const totalEventsTriggered = useMemo(() => filteredIssues.reduce((acc, i) => acc + (i.parsedEventCount || 0), 0), [filteredIssues]);

  const webIssueCount = useMemo(() => filteredIssues.filter((i) => i.project === 'cmm-sass-web').length, [filteredIssues]);
  const mobileIssueCount = useMemo(() => filteredIssues.filter((i) => i.project === 'cmm-mobile-end').length, [filteredIssues]);

  const criticalIssuesCount = useMemo(() => filteredIssues.filter((i) => i.userCount >= 100).length, [filteredIssues]);
  const avgEventsPerUser = totalUsersAffected > 0 ? parseFloat((totalEventsTriggered / totalUsersAffected).toFixed(1)) : 0;

  // Category & Culprit Summaries
  const categorySummaries = useMemo(() => getCategorySummaries(filteredIssues), [filteredIssues]);
  const culpritSummaries = useMemo(() => getCulpritModuleSummaries(filteredIssues), [filteredIssues]);
  const diagnosticInsights = useMemo(() => generateDiagnosticInsights(filteredIssues), [filteredIssues]);

  const availableCategories = useMemo(() => {
    const set = new Set<ErrorCategory>();
    issuesData.forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [issuesData]);

  // Custom Upload Handler
  const handleCustomDataUploaded = (report: SentryReportData) => {
    const processed = processIssues(report.issues, report.project);
    setIssuesData((prev) => [...processed, ...prev]);
  };

  // Export Summary Handler
  const handleExportReport = () => {
    const summaryText = `Sentry 异常分析报告导出摘要:
------------------------------------------
导出时间: ${new Date().toLocaleString()}
未解决异常数: ${totalIssuesCount} 项
受影响独立用户: ${totalUsersAffected} 人
触发总次数: ${totalEventsTriggered} 次

分类归因:
${categorySummaries.map((c) => `- ${c.category}: ${c.userCount}人受影响 (${c.issueCount}项)`).join('\n')}

TOP 高风险模块:
${culpritSummaries.slice(0, 5).map((m) => `- ${m.moduleName}: ${m.userCount}人受影响`).join('\n')}
`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sentry_Analysis_Report_${new Date().toISOString().substring(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-purple-500 selection:text-white pb-12">
      
      {/* Top Sticky Header */}
      <Header
        webRelease={webSentryReport.release}
        mobileRelease={mobileSentryReport.release}
        totalIssuesCount={totalIssuesCount}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExportReport={handleExportReport}
        onResetFilters={handleResetFilters}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Metric KPI Cards */}
        <MetricCards
          totalIssues={totalIssuesCount}
          totalUsers={totalUsersAffected}
          totalEvents={totalEventsTriggered}
          webIssueCount={webIssueCount}
          mobileIssueCount={mobileIssueCount}
          criticalIssuesCount={criticalIssuesCount}
          avgEventsPerUser={avgEventsPerUser}
          selectedProject={filters.project}
        />

        {/* Filter Controls Toolbar */}
        <FilterToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={availableCategories}
          totalFilteredCount={totalIssuesCount}
        />

        {/* Multi-Dimensional Recharts Visualization */}
        <ChartsSection
          issues={filteredIssues}
          categorySummaries={categorySummaries}
          culpritSummaries={culpritSummaries}
          selectedProject={filters.project}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
        />

        {/* AI Root Cause & Diagnostic Insights Guide */}
        <DiagnosticInsightsCard
          insights={diagnosticInsights}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
        />

        {/* Detailed Issue Table */}
        <IssuesTable
          issues={filteredIssues}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
        />

      </main>

      {/* Issue Detail Drawer/Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />

      {/* Custom Upload Sentry JSON Modal */}
      <CustomJsonUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataUploaded={handleCustomDataUploaded}
      />

    </div>
  );
}
