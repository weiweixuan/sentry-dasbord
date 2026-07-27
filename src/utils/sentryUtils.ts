import { SentryIssue, ErrorCategory, CategorySummary, DiagnosticInsight, CulpritModuleSummary } from '../types';

export const CATEGORY_COLORS: Record<ErrorCategory, string> = {
  'Map SDK (Amap)': '#3B82F6',       // Blue
  'Print SDK (Lodop)': '#8B5CF6',     // Purple
  'TypeError': '#EF4444',             // Red
  'Network/API': '#F59E0B',           // Amber
  'DOM/Selector': '#10B981',          // Emerald
  'React/State': '#EC4899',           // Pink
  'Security/Permission': '#DC2626',   // Dark Red
  'Extension/ThirdParty': '#6B7280',  // Gray
  'Syntax/Reference': '#84CC16',      // Lime
  'Unknown/Other': '#64748B'          // Slate
};

export function classifyIssueCategory(issue: SentryIssue): ErrorCategory {
  const title = (issue.title || '').toLowerCase();
  const culprit = (issue.culprit || '').toLowerCase();

  // Map SDK
  if (
    culprit.includes('maps') ||
    culprit.includes('amap') ||
    title.includes('amap') ||
    title.includes('pathsimplifier') ||
    title.includes('getbounds') ||
    culprit.includes('loca') ||
    title.includes('geocoder')
  ) {
    return 'Map SDK (Amap)';
  }

  // Print SDK (Lodop)
  if (
    culprit.includes('lodop') ||
    culprit.includes('printmanager') ||
    culprit.includes('printslndialog') ||
    title.includes('printer') ||
    title.includes('lodop') ||
    title.includes('set_licenses') ||
    title.includes('get_printer_count') ||
    title.includes('set_print_copies')
  ) {
    return 'Print SDK (Lodop)';
  }

  // Extension/ThirdParty
  if (culprit.includes('chrome-extension') || culprit.includes('baiduwangpan') || culprit.includes('zalojsv2')) {
    return 'Extension/ThirdParty';
  }

  // Network / API
  if (
    title.includes('network') ||
    title.includes('fetch') ||
    title.includes('connection') ||
    title.includes('断开') ||
    title.includes('网络连接') ||
    culprit.includes('fetchapi') ||
    culprit.includes('axios')
  ) {
    return 'Network/API';
  }

  // Security / Permission
  if (title.includes('securityerror') || title.includes('permission denied') || title.includes('blocked a frame')) {
    return 'Security/Permission';
  }

  // React / State Lifecycle
  if (
    title.includes('maximum update depth') ||
    title.includes('reducers may not dispatch') ||
    title.includes('invariant violation') ||
    culprit.includes('react-dom') ||
    culprit.includes('react-dnd') ||
    culprit.includes('updater.enqueueforceupdate')
  ) {
    return 'React/State';
  }

  // DOM / Selector / Ref
  if (
    title.includes('queryselector') ||
    title.includes('insertbefore') ||
    title.includes('removechild') ||
    title.includes('clientleft') ||
    title.includes('offsetwidth') ||
    title.includes('scrollintoview') ||
    title.includes('contains') ||
    title.includes('clientwidth')
  ) {
    return 'DOM/Selector';
  }

  // Syntax / Reference
  if (title.includes('referenceerror') || title.includes('syntaxerror') || title.includes('is not defined')) {
    return 'Syntax/Reference';
  }

  // TypeError
  if (title.includes('typeerror') || title.includes('cannot read') || title.includes('is not a function')) {
    return 'TypeError';
  }

  return 'Unknown/Other';
}

export function parseNum(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function processIssues(issues: SentryIssue[], projectName: string): SentryIssue[] {
  return issues.map((issue) => {
    const events = parseNum(issue.eventCount);
    const users = issue.userCount || 0;
    const category = classifyIssueCategory(issue);

    // Calculate recency based on lastSeen date
    const lastSeenDate = new Date(issue.lastSeen);
    const now = new Date('2026-07-27T12:00:00Z');
    const diffHours = (now.getTime() - lastSeenDate.getTime()) / (1000 * 3600);

    let recencyStatus: 'critical' | 'recent' | 'longstanding' = 'recent';
    if (diffHours <= 6) {
      recencyStatus = 'critical'; // Seen in last 6 hrs
    } else if (diffHours > 72) {
      recencyStatus = 'longstanding'; // Over 3 days old
    }

    const ratio = users > 0 ? parseFloat((events / users).toFixed(2)) : 0;

    return {
      ...issue,
      project: projectName,
      parsedEventCount: events,
      category,
      recencyStatus,
      userImpactRatio: ratio
    };
  });
}

export function getCategorySummaries(issues: SentryIssue[]): CategorySummary[] {
  const map = new Map<ErrorCategory, { issueCount: number; eventCount: number; userCount: number }>();

  issues.forEach((issue) => {
    const cat = issue.category || classifyIssueCategory(issue);
    const curr = map.get(cat) || { issueCount: 0, eventCount: 0, userCount: 0 };
    map.set(cat, {
      issueCount: curr.issueCount + 1,
      eventCount: curr.eventCount + (issue.parsedEventCount || parseNum(issue.eventCount)),
      userCount: curr.userCount + (issue.userCount || 0)
    });
  });

  return Array.from(map.entries()).map(([category, stats]) => ({
    category,
    issueCount: stats.issueCount,
    eventCount: stats.eventCount,
    userCount: stats.userCount,
    color: CATEGORY_COLORS[category] || '#64748B'
  })).sort((a, b) => b.userCount - a.userCount);
}

export function getCulpritModuleSummaries(issues: SentryIssue[]): CulpritModuleSummary[] {
  const map = new Map<string, { issueCount: number; eventCount: number; userCount: number }>();

  issues.forEach((issue) => {
    let mod = '未知模块/匿名函数';
    const culprit = issue.culprit || '';

    if (culprit.includes('maps') || culprit.includes('amap') || culprit.includes('AddrSug')) {
      mod = '地图与地址推荐模块 (Amap / AddrSug)';
    } else if (culprit.includes('lodopFunc') || culprit.includes('printManager')) {
      mod = '套打与 Lodop 打印套件';
    } else if (culprit.includes('orderEditor') || culprit.includes('OrderEditor')) {
      mod = '运单/订单编辑器 (OrderEditor)';
    } else if (culprit.includes('BiPickOrderContent') || culprit.includes('pickorder')) {
      mod = '智能接单与配载 (BiPickOrder)';
    } else if (culprit.includes('fetchApi') || culprit.includes('axios') || culprit.includes('coInfo')) {
      mod = '网络请求与基础 API 代理';
    } else if (culprit.includes('DriverAssistant')) {
      mod = '司机助手 / 移动端路由与助手';
    } else if (culprit.includes('FinanceController') || culprit.includes('BillDetatil')) {
      mod = '财务结算与账单控制器';
    } else if (culprit.includes('ContextMenu') || culprit.includes('ScrollableTabBarMixin')) {
      mod = '通用 UI 交互组件 (ContextMenu / Tabs)';
    } else {
      // Clean extracted path
      const match = culprit.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        mod = match[1];
      } else if (culprit.startsWith('http')) {
        mod = '外部 API 或 Webview Context';
      } else if (culprit) {
        mod = culprit.length > 40 ? culprit.substring(0, 40) + '...' : culprit;
      }
    }

    const curr = map.get(mod) || { issueCount: 0, eventCount: 0, userCount: 0 };
    map.set(mod, {
      issueCount: curr.issueCount + 1,
      eventCount: curr.eventCount + (issue.parsedEventCount || parseNum(issue.eventCount)),
      userCount: curr.userCount + (issue.userCount || 0)
    });
  });

  return Array.from(map.entries())
    .map(([moduleName, stats]) => ({
      moduleName,
      issueCount: stats.issueCount,
      eventCount: stats.eventCount,
      userCount: stats.userCount,
      description: `包含 ${stats.issueCount} 个报错条目，共产生 ${stats.eventCount} 次异常日志`
    }))
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 10);
}

export function generateDiagnosticInsights(issues: SentryIssue[]): DiagnosticInsight[] {
  const insights: DiagnosticInsight[] = [
    {
      id: 'diag-amap',
      title: '高德地图 SDK (Amap / PathSimplifier) 异步加载与销毁空指针',
      category: 'Map SDK (Amap)',
      affectedProjects: ['cmm-sass-web', 'cmm-mobile-end'],
      issueCount: issues.filter(i => i.category === 'Map SDK (Amap)').length,
      totalEvents: issues.filter(i => i.category === 'Map SDK (Amap)').reduce((acc, i) => acc + (i.parsedEventCount || 0), 0),
      totalUsers: issues.filter(i => i.category === 'Map SDK (Amap)').reduce((acc, i) => acc + i.userCount, 0),
      severity: 'high',
      rootCause: '高德地图及轨迹组件在组件卸载 (unmount) 时，`c.getBounds` / `c.Mi` / `clientWidth` 未判定地块 Canvas 实例是否存在即强行读取属性；且 `http://webapi.amap.com/count` 静态资源在弱网下加载超时。',
      recommendation: '在调用 `map.getBounds()` 或 `PathSimplifier` 前增加 `map && map.isDestroyed?.() === false` 及可选链操作符；并针对 `http` 协议引入 HTTPS 统一代理和超时 fallback 防抖。',
      exampleIssues: issues.filter(i => i.category === 'Map SDK (Amap)').slice(0, 3)
    },
    {
      id: 'diag-lodop',
      title: 'Lodop 打印控件初始化未注入 SET_LICENSES / 驱动未挂载',
      category: 'Print SDK (Lodop)',
      affectedProjects: ['cmm-sass-web'],
      issueCount: issues.filter(i => i.category === 'Print SDK (Lodop)').length,
      totalEvents: issues.filter(i => i.category === 'Print SDK (Lodop)').reduce((acc, i) => acc + (i.parsedEventCount || 0), 0),
      totalUsers: issues.filter(i => i.category === 'Print SDK (Lodop)').reduce((acc, i) => acc + i.userCount, 0),
      severity: 'high',
      rootCause: '客户端在未安装或未启动 CLodop 本地服务的环境中触发套打时，`getLodop()` 返回了 `undefined`，导致调用 `n.SET_LICENSES` 或 `GET_PRINTER_COUNT` 直接抛出致命异常。',
      recommendation: '改写 `getLodop` 包装函数：当环境检测不通过时提前拦截，提示“请先开启本地 Lodop 打印服务”，避免链式调用未定义的方法。',
      exampleIssues: issues.filter(i => i.category === 'Print SDK (Lodop)').slice(0, 3)
    },
    {
      id: 'diag-react-depth',
      title: 'React setState 循环渲染 & Reducer 非法 dispatch 行为',
      category: 'React/State',
      affectedProjects: ['cmm-sass-web'],
      issueCount: issues.filter(i => i.category === 'React/State').length,
      totalEvents: issues.filter(i => i.category === 'React/State').reduce((acc, i) => acc + (i.parsedEventCount || 0), 0),
      totalUsers: issues.filter(i => i.category === 'React/State').reduce((acc, i) => acc + i.userCount, 0),
      severity: 'high',
      rootCause: '在 `orderEditor` 中 Middleware 逻辑里，Reducer 执行过程中同步触发了新 Action 分发，或在 render 函数中未加依赖项导致 `setState` 触发无限更新。',
      recommendation: '审计 `orderEditor/jmInfo/middleware` 中 `next()` 调用逻辑，确保 Reducer 保持纯函数；在 `useEffect` 或事件回调中使用异步 `setTimeout` 或 Promise 隔离 dispatch 阶段。',
      exampleIssues: issues.filter(i => i.category === 'React/State').slice(0, 3)
    },
    {
      id: 'diag-null-pointers',
      title: '异步接口返回空对象导致的解构与属性访问崩塌',
      category: 'TypeError',
      affectedProjects: ['cmm-sass-web', 'cmm-mobile-end'],
      issueCount: issues.filter(i => i.category === 'TypeError').length,
      totalEvents: issues.filter(i => i.category === 'TypeError').reduce((acc, i) => acc + (i.parsedEventCount || 0), 0),
      totalUsers: issues.filter(i => i.category === 'TypeError').reduce((acc, i) => acc + i.userCount, 0),
      severity: 'medium',
      rootCause: '诸如 `tableSwitch` / `oppositeNameInputAuto` 等业务逻辑中假定 API 必然返回结构完整的数据，直接执行 `.getStateData` / `.pois.map` / `.ok`。',
      recommendation: '引入可选链 `res?.pois?.map?.()` 和防御性默认值（如 `{}` / `[]`），在全局 Fetch/Axios 拦截器中规范化错误 Response 结构。',
      exampleIssues: issues.filter(i => i.category === 'TypeError').slice(0, 3)
    },
    {
      id: 'diag-browser-ext',
      title: '第三方 Chrome 插件/注入脚本导致的伪报错误',
      category: 'Extension/ThirdParty',
      affectedProjects: ['cmm-sass-web'],
      issueCount: issues.filter(i => i.category === 'Extension/ThirdParty').length,
      totalEvents: issues.filter(i => i.category === 'Extension/ThirdParty').reduce((acc, i) => acc + (i.parsedEventCount || 0), 0),
      totalUsers: issues.filter(i => i.category === 'Extension/ThirdParty').reduce((acc, i) => acc + i.userCount, 0),
      severity: 'low',
      rootCause: '用户浏览器安装了百度网盘等扩展插件（`chrome-extension://.../baiduwangpan.js`），插件试图调用未注入的 jQuery `$()` 导致日志上报。',
      recommendation: '在 Sentry SDK 初始化配置中配置 `ignoreErrors` 过滤列表（包含 `baiduwangpan.js` / `chrome-extension` / `zaloJSV2`），净化看板环境。',
      exampleIssues: issues.filter(i => i.category === 'Extension/ThirdParty').slice(0, 2)
    }
  ];

  return insights;
}
