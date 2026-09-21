import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Server,
  Database,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  X,
  Globe,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  getApiUrl,
  setApiUrl,
  resetApiUrl,
  checkServerHealth,
  HealthCheckResult,
} from '../apiUrl';

interface ServerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string) => void;
}

export function ServerConnectionModal({
  isOpen,
  onClose,
  onSaved,
}: ServerConnectionModalProps): React.ReactElement | null {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<HealthCheckResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getApiUrl();
      setInputUrl(current);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!inputUrl) return;
    setTesting(true);
    setTestResult(null);
    setSaveSuccess(false);

    const res = await checkServerHealth(inputUrl);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    setApiUrl(trimmed);
    setSaveSuccess(true);
    setTimeout(() => {
      onSaved?.(trimmed);
      onClose();
    }, 600);
  };

  const handleResetDefault = () => {
    resetApiUrl();
    const fallback = getApiUrl();
    setInputUrl(fallback);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#0b2034] text-[#f5efe6] border border-[#193a59] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#193a59] bg-[#071524]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#dfceb3]/15 text-[#dfceb3]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#dfceb3]">
                {isRtl ? 'إعدادات الاتصال بقاعدة البيانات والخادم' : 'Server & Database Connection'}
              </h3>
              <p className="text-xs text-[#9db1c3]">
                {isRtl
                  ? 'مزامنة البيانات والمستخدمين بين الأجهزة المختلفة'
                  : 'Sync data and users across multiple devices'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9db1c3] hover:text-[#f5efe6] hover:bg-[#193a59]/50 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-[#071524] rounded-xl border border-[#193a59] text-xs text-[#9db1c3] flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#dfceb3] shrink-0 mt-0.5" />
            <span>
              {isRtl
                ? 'عند استخدام البرنامج في جهاز آخر، ضع هنا رابط الخادم المشترك أو عنوان IP للجهاز الرئيسي حتى تظهر جميع المشاريع والمستخدمين في كلا الجهازين.'
                : 'When running this app on another device, specify the central server URL or primary device IP so all users and projects sync across both devices.'}
            </span>
          </div>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#dfceb3]">
              {isRtl ? 'عنوان الخادم وقاعدة البيانات (Server API URL)' : 'Server & Database API URL'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestResult(null);
                  setSaveSuccess(false);
                }}
                placeholder="http://localhost:3000 or https://your-server.com"
                className="w-full px-4 py-2.5 bg-[#071524] text-[#f5efe6] border border-[#193a59] rounded-xl text-sm font-mono placeholder-[#9db1c3]/40 focus:outline-none focus:ring-2 focus:ring-[#dfceb3] transition"
              />
              <div className="absolute inset-y-0 end-3 flex items-center">
                {testResult?.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : testResult && !testResult.ok ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <Globe className="w-4 h-4 text-[#9db1c3]/50" />
                )}
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#9db1c3] font-medium">
              {isRtl ? 'عناوين مقترحة سريعة:' : 'Quick Presets:'}
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setInputUrl('http://localhost:3000');
                  setTestResult(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#071524] hover:bg-[#193a59] border border-[#193a59] text-[#9db1c3] hover:text-[#dfceb3] transition"
              >
                Localhost (3000)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputUrl('http://192.168.1.100:3000');
                  setTestResult(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#071524] hover:bg-[#193a59] border border-[#193a59] text-[#9db1c3] hover:text-[#dfceb3] transition"
              >
                LAN (192.168.1.x)
              </button>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition animate-fadeIn ${
                testResult.ok
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
            >
              {testResult.ok ? (
                <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="font-semibold flex items-center justify-between">
                  <span>
                    {testResult.ok
                      ? isRtl
                        ? 'تم الاتصال بالخادم بنجاح!'
                        : 'Server connected successfully!'
                      : isRtl
                        ? 'تعذر الاتصال بالخادم'
                        : 'Connection failed'}
                  </span>
                  {testResult.latencyMs !== undefined && (
                    <span className="font-mono text-[11px] opacity-80">
                      {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
                {testResult.ok && testResult.database && (
                  <div className="text-[11px] opacity-90 flex items-center gap-1.5 pt-0.5">
                    <Layers className="w-3.5 h-3.5 text-[#dfceb3]" />
                    <span>
                      {isRtl ? 'محرك قاعدة البيانات:' : 'Database Engine:'}{' '}
                      <strong className="text-[#dfceb3] uppercase font-mono">
                        {testResult.database.type}
                      </strong>{' '}
                      {testResult.database.type === 'postgres'
                        ? isRtl
                          ? '(خادم سحابي مشترك)'
                          : '(Central Cloud Database)'
                        : isRtl
                          ? '(محلي SQLite)'
                          : '(Local SQLite)'}
                    </span>
                  </div>
                )}
                {!testResult.ok && testResult.error && (
                  <div className="text-[11px] opacity-80 pt-0.5">
                    {testResult.error}
                  </div>
                )}
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-fadeIn">
              {isRtl ? 'تم حفظ الرابط وتطبيقه بنجاح!' : 'Server URL saved and applied!'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#193a59] bg-[#071524]/60">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs text-[#9db1c3] hover:text-[#dfceb3] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'استعادة الافتراضي' : 'Reset Default'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !inputUrl}
              className="px-4 py-2 rounded-xl bg-[#193a59] hover:bg-[#204a70] text-[#f5efe6] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition"
            >
              {testing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-[#dfceb3]" />
              )}
              <span>{isRtl ? 'فحص الاتصال' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!inputUrl || testing}
              className="px-4 py-2 rounded-xl bg-[#dfceb3] hover:bg-[#d4c1a3] text-[#0b2034] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition shadow-md shadow-[#dfceb3]/10"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حفظ وتطبيق' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
