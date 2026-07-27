import React, { useState } from 'react';
import { X, Upload, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { SentryReportData } from '../types';

interface CustomJsonUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUploaded: (report: SentryReportData) => void;
}

export const CustomJsonUploadModal: React.FC<CustomJsonUploadModalProps> = ({
  isOpen,
  onClose,
  onDataUploaded
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage('文件读取失败，请检查是否为合法文本文件');
      }
    };
    reader.readAsText(file);
  };

  const handleParseAndApply = () => {
    try {
      if (!jsonText.trim()) {
        setErrorMessage('请输入或上传 Sentry JSON 数据');
        return;
      }

      const parsed = JSON.parse(jsonText);

      if (!parsed.issues || !Array.isArray(parsed.issues)) {
        setErrorMessage('缺失 `issues` 数组，请确认是否为标准 Sentry 导出的 JSON 结构');
        return;
      }

      const report: SentryReportData = {
        release: parsed.release || 'Custom-Release',
        environment: parsed.environment || 'prod',
        project: parsed.project || 'custom-sentry-project',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        totalIssues: parsed.totalIssues || parsed.issues.length,
        unresolved: parsed.unresolved || parsed.issues.length,
        resolved: parsed.resolved || 0,
        totalEvents: parsed.totalEvents || '0',
        totalUsers: parsed.totalUsers || 0,
        issues: parsed.issues
      };

      onDataUploaded(report);
      onClose();
    } catch (err: any) {
      setErrorMessage(`JSON 解析错误: ${err.message || '格式不合法'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">导入自定义 Sentry JSON 报告</h2>
            <p className="text-xs text-slate-400">支持粘贴 JSON 文本或选择本地 .json 文件</p>
          </div>
        </div>

        {/* Drag/Choose File */}
        <div className="my-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 bg-slate-950 hover:bg-slate-900/50 cursor-pointer transition">
            <FileCode className="w-7 h-7 text-purple-400 mb-1" />
            <span className="text-xs font-medium text-slate-200">点击选择本地 JSON 文件</span>
            <span className="text-[11px] text-slate-500 mt-0.5">支持标准的 Sentry Issues Export JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Textarea for JSON */}
        <div className="space-y-1 mb-4">
          <label className="text-xs font-medium text-slate-300">或直接粘贴 Sentry JSON 文本:</label>
          <textarea
            rows={6}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMessage(null);
            }}
            placeholder='{"project": "my-app", "issues": [{ "id": "123", "title": "TypeError...", ... }]}'
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleParseAndApply}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            解析并更新看板
          </button>
        </div>

      </div>
    </div>
  );
};

