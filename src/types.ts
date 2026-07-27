export interface SentryIssue {
  id: string;
  title: string;
  culprit: string | null;
  level: string;
  status: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: string | number;
  userCount: number;
  permalink: string;
  firstRelease: string | null;
  // Derived fields
  parsedEventCount?: number;
  project?: string;
  category?: ErrorCategory;
  recencyStatus?: 'critical' | 'recent' | 'longstanding';
  userImpactRatio?: number; // eventCount / userCount
}

export interface SentryReportData {
  release: string;
  environment: string;
  project: string;
  exportedAt: string;
  totalIssues: number;
  unresolved: number;
  resolved: number;
  totalEvents: string | number;
  totalUsers: number;
  issues: SentryIssue[];
}

export type ErrorCategory =
  | 'TypeError'
  | 'Network/API'
  | 'Map SDK (Amap)'
  | 'Print SDK (Lodop)'
  | 'DOM/Selector'
  | 'React/State'
  | 'Security/Permission'
  | 'Extension/ThirdParty'
  | 'Syntax/Reference'
  | 'Unknown/Other';

export interface CategorySummary {
  category: ErrorCategory;
  issueCount: number;
  eventCount: number;
  userCount: number;
  color: string;
}

export interface CulpritModuleSummary {
  moduleName: string;
  issueCount: number;
  eventCount: number;
  userCount: number;
  description: string;
}

export interface DiagnosticInsight {
  id: string;
  title: string;
  category: ErrorCategory;
  affectedProjects: string[];
  issueCount: number;
  totalEvents: number;
  totalUsers: number;
  severity: 'high' | 'medium' | 'low';
  rootCause: string;
  recommendation: string;
  exampleIssues: SentryIssue[];
}

export interface FilterState {
  project: string; // 'all' | 'cmm-sass-web' | 'cmm-mobile-end'
  category: string; // 'all' | ErrorCategory
  search: string;
  minUsers: number;
  recency: string; // 'all' | 'critical' | 'recent' | 'longstanding'
  sortBy: 'userCount' | 'eventCount' | 'lastSeen' | 'userImpactRatio';
  sortOrder: 'asc' | 'desc';
}
