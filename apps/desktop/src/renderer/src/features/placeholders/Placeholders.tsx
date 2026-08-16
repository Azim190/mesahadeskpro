import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../app/ThemeProvider';
import { useSync } from '../../shared/hooks/useSync';
import { DMC_STAMP_BASE64 } from '../../assets/stampData';
import { DMC_LOGO_BASE64 } from '../../assets/logoData';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Map,
  Link2,
  FileSignature,
  Settings,
  HelpCircle,
  Users,
  Sun,
  Moon,
  ArrowLeft,
  RefreshCw,
  Cloud,
  CloudOff,
  Check,
  Search,
  Filter,
  Plus,
  LogOut,
  User,
  FolderOpen,
  Trash2,
  Eye,
  Pencil,
  Download,
  UploadCloud,
  FileUp,
  Printer,
  Calendar,
  Info,
  Mail,
  MessageCircle,
  Coins,
  ClipboardList,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

// Progress Color Function based on Section 6 bands
export function getProgressColor(progress: number): string {
  if (progress <= 15) return 'bg-red-500'; // Red
  if (progress <= 25) return 'bg-orange-500'; // Orange
  if (progress <= 49) return 'bg-yellow-400'; // Light Yellow
  if (progress <= 75) return 'bg-green-400'; // Light Green
  return 'bg-green-700'; // Dark Green
}

// Dar Makkah (DMC) Official Corporate Logo Component
export function DmcLogo({ className = "", isCompact = false }: { className?: string; isCompact?: boolean }): React.ReactElement {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={DMC_LOGO_BASE64}
        alt="DMC للاستشارات الهندسية - Engineering Consultancy"
        className={`object-contain pointer-events-none drop-shadow-sm transition-all rounded-lg bg-white/95 p-1 border border-border/40 ${
          isCompact ? 'h-8 max-w-[130px]' : 'h-10 max-w-[170px]'
        }`}
      />
    </div>
  );
}

// Dar Makkah (DMC) Official Stamp Component
export function DmcStamp({ className = "" }: { className?: string }): React.ReactElement {
  return (
    <img
      src={DMC_STAMP_BASE64}
      alt="DMC Official Stamp - شركة دار مكة للاستشارات الهندسية"
      className={`object-contain drop-shadow-sm select-none pointer-events-none ${className}`}
    />
  );
}

// Stored local project interface (for typing)
export interface ProjectItem {
  id: string;
  tenantId: string;
  clientId: string;
  projectNumber: string;
  workType: string;
  status: string;
  progress: number;
  locationLat?: number | null;
  locationLng?: number | null;
  locationText?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  clientPhone?: string;
  projectName?: string;
  createdBy?: string;
}

// Client interface
// Beautiful In-App Confirmation Modal Component (Replaces browser popups)
export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  description?: string;
  itemName?: string;
  itemBadge?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  description,
  itemName,
  itemBadge,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps): React.ReactElement | null {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (!isOpen) return null;

  const defaultTitle = variant === 'danger'
    ? (isRtl ? 'تأكيد الحذف النهائي' : 'Confirm Deletion')
    : (isRtl ? 'تأكيد الإجراء' : 'Confirm Action');

  const defaultMessage = variant === 'danger'
    ? (isRtl ? 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذه العملية.' : 'Are you sure you want to delete this item? This action cannot be undone.')
    : (isRtl ? 'هل ترغب في تأكيد المتابعة؟' : 'Are you sure you want to proceed?');

  const defaultConfirmLabel = variant === 'danger'
    ? (isRtl ? 'حذف نهائي' : 'Delete Permanently')
    : (isRtl ? 'تأكيد' : 'Confirm');

  const defaultCancelLabel = isRtl ? 'إلغاء' : 'Cancel';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div 
        className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title Header */}
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl flex-shrink-0 ${
            variant === 'danger'
              ? 'bg-rose-500/15 text-rose-500 ring-4 ring-rose-500/10'
              : 'bg-amber-500/15 text-amber-500 ring-4 ring-amber-500/10'
          }`}>
            {variant === 'danger' ? (
              <Trash2 className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-foreground">
              {title || defaultTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {message || defaultMessage}
            </p>
          </div>
        </div>

        {/* Item Info Box (if provided) */}
        {(itemName || itemBadge || description) && (
          <div className="p-3.5 bg-muted/40 border border-border/60 rounded-xl space-y-1.5 text-xs">
            {itemBadge && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">
                {itemBadge}
              </span>
            )}
            {itemName && (
              <div className="font-bold text-foreground truncate">
                {itemName}
              </div>
            )}
            {description && (
              <p className="text-muted-foreground text-[11px]">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 font-sans">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold border border-border bg-background hover:bg-accent text-foreground rounded-xl transition-all disabled:opacity-50"
          >
            {cancelLabel || defaultCancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isRtl ? 'جاري المعالجة...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                {variant === 'danger' && <Trash2 className="h-3.5 w-3.5" />}
                <span>{confirmLabel || defaultConfirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ClientItem {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Attachment interface
export interface AttachmentItem {
  id: string;
  fileName: string;
  filePath: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface AuditLogItem {
  timestamp: string;
  user: string;
  action: string;
  oldProgress?: number;
  newProgress?: number;
  oldStatus?: string;
  newStatus?: string;
}

export interface ProjectDetailsJson {
  projectName?: string;
  attachments?: AttachmentItem[];
  metadata?: Record<string, string>;
  auditLogs?: AuditLogItem[];
  createdBy?: string;
  quotation?: any;
}

// Workflow steps structure
interface WorkflowStep {
  key: string;
  percentage: number;
}

export const WORKFLOW_STEPS: Record<string, WorkflowStep[]> = {
  SURVEY_TRANSFER: [
    { key: 'step1', percentage: 20 },
    { key: 'step2', percentage: 40 },
    { key: 'step3', percentage: 60 },
    { key: 'step4', percentage: 80 },
    { key: 'step5', percentage: 100 },
  ],
  REPORTS: [
    { key: 'step1', percentage: 25 },
    { key: 'step2', percentage: 50 },
    { key: 'step3', percentage: 75 },
    { key: 'step4', percentage: 100 },
  ],
  SURVEY_SKETCH: [
    { key: 'step1', percentage: 25 },
    { key: 'step2', percentage: 50 },
    { key: 'step3', percentage: 75 },
    { key: 'step4', percentage: 100 },
  ],
  BALADI_TRANSACTION: [
    { key: 'step1', percentage: 20 },
    { key: 'step2', percentage: 40 },
    { key: 'step3', percentage: 60 },
    { key: 'step4', percentage: 80 },
    { key: 'step5', percentage: 100 },
  ],
  SURVEY_DECISION: [
    { key: 'step1', percentage: 20 },
    { key: 'step2', percentage: 40 },
    { key: 'step3', percentage: 60 },
    { key: 'step4', percentage: 80 },
    { key: 'step5', percentage: 100 },
  ],
  PRICE_OFFERS: [
    { key: 'step1', percentage: 25 },
    { key: 'step2', percentage: 50 },
    { key: 'step3', percentage: 75 },
    { key: 'step4', percentage: 100 },
  ],
  CONTRACTS: [
    { key: 'step1', percentage: 20 },
    { key: 'step2', percentage: 40 },
    { key: 'step3', percentage: 60 },
    { key: 'step4', percentage: 80 },
    { key: 'step5', percentage: 100 },
  ],
};

export function getActiveStep(workType: string, progress: number): WorkflowStep | null {
  const steps = WORKFLOW_STEPS[workType];
  if (!steps) return null;
  const step = steps.find((s) => s.percentage === progress);
  if (step) return step;
  const completed = steps.filter((s) => progress >= s.percentage);
  if (completed.length === 0) return null;
  return completed[completed.length - 1];
}

// Common wrapper for placeholders to avoid duplication
function PlaceholderWrapper({
  title,
  icon: Icon,
  children,
  currentWorkType,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  currentWorkType?: string;
}): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { isOnline, isSyncing, pendingCount, lastSyncTime, triggerSync } = useSync();

  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  useEffect(() => {
    // Authenticate layout
    window.api.secureStorage.getItem('accessToken').then((token) => {
      if (!token) {
        navigate('/login');
      }
    });

    // Load user profile details
    window.api.secureStorage.getItem('user').then((userStr) => {
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          // ignore
        }
      }
    });
  }, [navigate]);

  const toggleLanguage = (): void => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    await window.api.secureStorage.removeItem('accessToken');
    await window.api.secureStorage.removeItem('refreshToken');
    await window.api.secureStorage.removeItem('user');
    navigate('/login');
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row print:bg-white print:text-black" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-card border-e border-border p-6 flex flex-col justify-between shadow-sm print:hidden">
        <div>
          <div className="mb-8 pb-5 border-b border-border/70">
            <DmcLogo className="text-primary" />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-0.5">
              <span>{isRtl ? 'قسم المساحة الهندسية' : 'Surveying Dept.'}</span>
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-mono">{user?.role || 'Admin'}</span>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <LayoutDashboard className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.dashboard')}</span>
            </Link>
            <Link
              to="/master-log"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <ClipboardList className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{isRtl ? 'سجل المعاملات العام' : 'Master Log Sheet'}</span>
            </Link>
            <div className="pt-2 pb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3">
              {isRtl ? 'أعمال المساحة' : 'Surveying Work'}
            </div>
            <Link
              to="/work/survey-transfer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <FileSpreadsheet className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.surveyTransfer')}</span>
            </Link>
            <Link
              to="/work/reports"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <FileText className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.reports')}</span>
            </Link>
            <Link
              to="/work/survey-sketch"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Map className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.surveySketch')}</span>
            </Link>
            <Link
              to="/work/baladi-transactions"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Link2 className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.baladiTransactions')}</span>
            </Link>
            <Link
              to="/work/survey-decision"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <FileSignature className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.surveyDecision')}</span>
            </Link>
            <Link
              to="/work/price-offers"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Coins className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.priceOffers')}</span>
            </Link>
            <Link
              to="/work/contracts"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <FileSignature className="h-4.5 w-4.5 text-muted-foreground" />
              <span>{t('nav.contracts')}</span>
            </Link>
            <div className="pt-4 border-t border-border mt-4">
              <Link
                to="/settings/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Users className="h-4.5 w-4.5 text-muted-foreground" />
                <span>{t('nav.users')}</span>
              </Link>
              <Link
                to="/settings/general"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Settings className="h-4.5 w-4.5 text-muted-foreground" />
                <span>{t('nav.general')}</span>
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-border">
          <Link
            to="/support"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-primary transition-all"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            <span>{t('nav.support')}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border px-6 md:px-8 flex items-center justify-between bg-card shadow-sm z-10 print:hidden">
          <div className="flex items-center gap-4 flex-1">
            <Icon className="h-5.5 w-5.5 text-primary" />
            <h2 className="text-lg font-bold hidden sm:inline-block">{title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Project Button */}
            <button
              onClick={() => {
                if (currentWorkType) {
                  navigate(`/dashboard?addType=${currentWorkType}`);
                } else {
                  setAddProjectOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t('common.addProject')}</span>
            </button>

            {/* Connection & Sync Status Badge */}
            <button
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-sm font-semibold transition-all shadow-sm ${
                isOnline
                  ? 'border-green-200/30 bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'border-muted bg-muted/50 text-muted-foreground'
              }`}
              title={
                isOnline
                  ? (i18n.language === 'ar'
                      ? `متصل بالشبكة. آخر مزامنة: ${lastSyncTime ? lastSyncTime.toLocaleTimeString(i18n.language) : 'لا يوجد'}. انقر للمزامنة.`
                      : `Online. Last synced: ${lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'never'}. Click to sync.`)
                  : (i18n.language === 'ar'
                      ? 'غير متصل بالشبكة. يتم حفظ التعديلات محلياً وسيتم إرسالها لاحقاً.'
                      : 'Offline. Changes are saved locally and enqueued.')
              }
            >
              {isOnline ? (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  {isSyncing ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : pendingCount > 0 ? (
                    <Cloud className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  )}
                  <span className="hidden lg:inline text-xs">
                    {isSyncing
                      ? (i18n.language === 'ar' ? 'جاري المزامنة...' : 'Syncing...')
                      : pendingCount > 0
                        ? (i18n.language === 'ar' ? `${pendingCount} معلقة` : `${pendingCount} pending`)
                        : (i18n.language === 'ar' ? 'محدث' : 'Synced')}
                  </span>
                </>
              ) : (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  <CloudOff className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline text-xs">
                    {pendingCount > 0
                      ? (i18n.language === 'ar' ? `${pendingCount} أوفلاين` : `${pendingCount} offline`)
                      : (i18n.language === 'ar' ? 'أوفلاين' : 'Offline')}
                  </span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
            >
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* Theme Selector */}
            <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted">
              <button
                onClick={(): void => setTheme('light')}
                className={`p-1 rounded-md transition-all ${theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                title={t('common.light')}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(): void => setTheme('dark')}
                className={`p-1 rounded-md transition-all ${theme === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                title={t('common.dark')}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* User Dropdown Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm"
                title={isRtl ? 'ملف المستخدم' : 'User Profile'}
              >
                <User className="h-4.5 w-4.5" />
              </button>

              {userMenuOpen && (
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-48 bg-card border border-border rounded-xl shadow-lg p-2 z-20 space-y-1`}>
                  <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border mb-1">
                    <div className="font-bold text-foreground text-sm truncate">{user?.fullName || 'User'}</div>
                    <div className="text-[10px] mt-0.5 uppercase tracking-wider">{user?.role || 'Staff'}</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      alert(isRtl ? 'تفاصيل ملف المستخدم والخيارات الشخصية...' : 'Profile details configuration...');
                    }}
                    className="w-full text-start px-3 py-2 text-xs font-semibold hover:bg-accent hover:text-accent-foreground rounded-lg transition-all"
                  >
                    {t('common.profile')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-start px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Content */}
        <div className="flex-1 p-6 md:p-8 overflow-auto print:p-0 survey-grid-bg animate-reveal">
          {children}
        </div>
      </main>

      {/* Add Project Work-Type Picker Modal */}
      {addProjectOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-bold">{t('common.selectWorkType')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('common.chooseTypeMsg')}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setAddProjectOpen(false);
                  navigate('/dashboard?addType=SURVEY_TRANSFER');
                }}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-start transition-all"
              >
                <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
                <span>{t('nav.surveyTransfer')}</span>
              </button>
              <button
                onClick={() => {
                  setAddProjectOpen(false);
                  navigate('/dashboard?addType=REPORTS');
                }}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-start transition-all"
              >
                <FileText className="h-4.5 w-4.5 text-primary" />
                <span>{t('nav.reports')}</span>
              </button>
              <button
                onClick={() => {
                  setAddProjectOpen(false);
                  navigate('/dashboard?addType=SURVEY_SKETCH');
                }}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-start transition-all"
              >
                <Map className="h-4.5 w-4.5 text-primary" />
                <span>{t('nav.surveySketch')}</span>
              </button>
              <button
                onClick={() => {
                  setAddProjectOpen(false);
                  navigate('/dashboard?addType=BALADI_TRANSACTION');
                }}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-start transition-all"
              >
                <Link2 className="h-4.5 w-4.5 text-primary" />
                <span>{t('nav.baladiTransactions')}</span>
              </button>
              <button
                onClick={() => {
                  setAddProjectOpen(false);
                  navigate('/dashboard?addType=SURVEY_DECISION');
                }}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-start transition-all"
              >
                <FileSignature className="h-4.5 w-4.5 text-primary" />
                <span>{t('nav.surveyDecision')}</span>
              </button>
              <button
                onClick={() => {
                  setAddProjectOpen(false);
                  navigate('/dashboard?addType=PRICE_OFFERS');
                }}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-start transition-all"
              >
                <Coins className="h-4.5 w-4.5 text-primary" />
                <span>{t('nav.priceOffers')}</span>
              </button>
              <button
                onClick={() => {
                  setAddProjectOpen(false);
                  navigate('/dashboard?addType=CONTRACTS');
                }}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-start transition-all"
              >
                <FileSignature className="h-4.5 w-4.5 text-primary" />
                <span>{t('nav.contracts')}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAddProjectOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------- PROJECTS & CLIENTS EDIT/ADD DIALOG -----------------

function ProjectFormModal({
  open,
  onClose,
  isEdit,
  editProjectId,
  workTypeArg,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  isEdit: boolean;
  editProjectId?: string;
  workTypeArg?: string;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields State
  const [projectName, setProjectName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('PENDING');
  const [locationText, setLocationText] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [metadata, setMetadataObj] = useState<Record<string, string>>({});
  const [currentProjectId, setCurrentProjectId] = useState('');

  // Search Client term
  const [clientSearch, setClientSearch] = useState('');

  // Dropdown list control
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const workType = workTypeArg || 'SURVEY_TRANSFER';

  const updateMetadata = (key: string, val: string) => {
    setMetadataObj((prev) => ({ ...prev, [key]: val }));
  };

  const loadFormDetails = async () => {
    try {
      const clientList = await window.api.localDb.getClients();
      setClients(clientList as ClientItem[]);

      if (isEdit && editProjectId) {
        const proj = await window.api.localDb.getProjectById(editProjectId);
        if (proj) {
          const project = proj as ProjectItem;
          setProjectName(project.projectName || '');
          setProjectNumber(project.projectNumber);
          setSelectedClientId(project.clientId);
          setProgress(project.progress);
          setStatus(project.status);
          setLocationText(project.locationText || '');
          setLocationLat(project.locationLat ? String(project.locationLat) : '');
          setLocationLng(project.locationLng ? String(project.locationLng) : '');
          setNotes(project.notes || '');

          // Load attachments and metadata from project details JSON
          const details = (await window.api.localDb.getProjectDetails(editProjectId)) as { detailsJson?: ProjectDetailsJson } | null;
          if (details && details.detailsJson) {
            setAttachments(details.detailsJson.attachments as AttachmentItem[] || []);
            setMetadataObj(details.detailsJson.metadata as Record<string, string> || {});
            if (details.detailsJson.projectName) {
              setProjectName(details.detailsJson.projectName);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(null);
      setProjectName('');
      setProjectNumber('');
      setSelectedClientId('');
      setIsNewClient(false);
      setNewClientName('');
      setNewClientPhone('');
      setProgress(0);
      setStatus('PENDING');
      setLocationText('');
      setLocationLat('');
      setLocationLng('');
      setNotes('');
      setAttachments([]);
      setMetadataObj({});
      setClientSearch('');

      if (isEdit && editProjectId) {
        setCurrentProjectId(editProjectId);
      } else {
        setCurrentProjectId(window.crypto.randomUUID());
      }

      loadFormDetails();
    }
  }, [open, isEdit, editProjectId]);

  // Project Number Auto Sequence Generator
  useEffect(() => {
    if (open && !isEdit) {
      if (workType !== 'PRICE_OFFERS' && workType !== 'CONTRACTS') {
        const year = new Date().getFullYear();
        window.api.localDb.getProjects().then((projs) => {
          const count = projs.length;
          const seq = (count + 1).toString().padStart(4, '0');
          setProjectNumber(`SUR-${year}-${seq}`);
        });
      }
    }
  }, [open, isEdit, workType]);

  // Auto-generate Contract reference number (e.g. DMC-MK-CTR-026-001)
  useEffect(() => {
    if (open && !isEdit && workType === 'CONTRACTS') {
      window.api.localDb.getProjects().then((projs) => {
        const projectsList = projs as ProjectItem[];
        const contracts = projectsList.filter(p => p.workType === 'CONTRACTS');
        const ctrSeq = (contracts.length + 1).toString().padStart(3, '0');
        const currentYear = new Date().getFullYear();
        const yearStr = `0${currentYear.toString().slice(-2)}`;
        
        const clean = (locationText || '').trim().toLowerCase();
        let locCode = 'MK';
        if (clean) {
          if (clean.includes('makkah') || clean.includes('مكة') || clean.includes('مكه')) locCode = 'MK';
          else if (clean.includes('jeddah') || clean.includes('jedhah') || clean.includes('جدة') || clean.includes('جده')) locCode = 'JD';
          else if (clean.includes('madinah') || clean.includes('المدينة') || clean.includes('مدينه')) locCode = 'MD';
          else if (clean.includes('riyadh') || clean.includes('الرياض')) locCode = 'RY';
          else if (clean.includes('dammam') || clean.includes('الدمام')) locCode = 'DM';
          else if (clean.includes('khobar') || clean.includes('الخبر')) locCode = 'KH';
          else if (clean.includes('taif') || clean.includes('الطائف') || clean.includes('الطايف')) locCode = 'TF';
          else if (clean.includes('tabuk') || clean.includes('تبوك')) locCode = 'TB';
          else if (clean.includes('abha') || clean.includes('ابها') || clean.includes('أبها')) locCode = 'AB';
        }
        
        const generatedRef = `DMC-${locCode}-CTR-${yearStr}-${ctrSeq}`;
        setProjectNumber(generatedRef);
        setMetadataObj(prev => ({ ...prev, contractNumber: generatedRef }));
      });
    }
  }, [open, isEdit, workType, locationText]);

  // Auto-generate Price Offer reference number (e.g. DMC-MK-PO-026-001)
  useEffect(() => {
    if (open && !isEdit && workType === 'PRICE_OFFERS') {
      window.api.localDb.getProjects().then((projs) => {
        const projectsList = projs as ProjectItem[];
        
        // Count existing price offers
        const priceOffers = projectsList.filter(p => p.workType === 'PRICE_OFFERS');
        const offerSeq = (priceOffers.length + 1).toString().padStart(3, '0');
        
        // Year representation: e.g. 2026 -> 026
        const currentYear = new Date().getFullYear();
        const yearStr = `0${currentYear.toString().slice(-2)}`;
        
        // Location code generation from locationText
        const clean = (locationText || '').trim().toLowerCase();
        let locCode = 'MK'; // default is Makkah (MK)
        
        if (clean) {
          if (clean.includes('makkah') || clean.includes('مكة') || clean.includes('مكه')) locCode = 'MK';
          else if (clean.includes('jeddah') || clean.includes('jedhah') || clean.includes('جدة') || clean.includes('جده')) locCode = 'JD';
          else if (clean.includes('madinah') || clean.includes('المدينة') || clean.includes('مدينه')) locCode = 'MD';
          else if (clean.includes('riyadh') || clean.includes('الرياض')) locCode = 'RY';
          else if (clean.includes('dammam') || clean.includes('الدمام')) locCode = 'DM';
          else if (clean.includes('khobar') || clean.includes('الخبر')) locCode = 'KH';
          else if (clean.includes('taif') || clean.includes('الطائف') || clean.includes('الطايف')) locCode = 'TF';
          else if (clean.includes('tabuk') || clean.includes('تبوك')) locCode = 'TB';
          else if (clean.includes('abha') || clean.includes('ابها') || clean.includes('أبها')) locCode = 'AB';
          else if (clean.includes('jazan') || clean.includes('جازان') || clean.includes('جيزان')) locCode = 'JZ';
          else if (clean.includes('buraidah') || clean.includes('بريدة') || clean.includes('بريده')) locCode = 'BR';
          else if (clean.includes('hofuf') || clean.includes('الهفوف') || clean.includes('هفوف')) locCode = 'HF';
          else if (clean.includes('jubail') || clean.includes('الجبيل') || clean.includes('جبيل')) locCode = 'JB';
          else if (clean.includes('hail') || clean.includes('حائل') || clean.includes('حايل')) locCode = 'HL';
          else if (clean.includes('najran') || clean.includes('نجران')) locCode = 'NJ';
          else if (clean.includes('yanbu') || clean.includes('ينبع')) locCode = 'YB';
          else if (clean.includes('qatif') || clean.includes('القطيف')) locCode = 'QT';
          else {
            // Fallback: extract 1st and 3rd letters of English name
            const latin = clean.replace(/[^a-z]/g, '').toUpperCase();
            if (latin.length >= 3) {
              locCode = latin[0] + latin[2];
            } else if (latin.length === 2) {
              locCode = latin;
            } else if (latin.length === 1) {
              locCode = latin + 'X';
            }
          }
        }
        
        const generatedRef = `DMC-${locCode}-PO-${yearStr}-${offerSeq}`;
        
        setProjectNumber(generatedRef);
        setMetadataObj(prev => {
          // Sync to offerNumber too
          return { ...prev, offerNumber: generatedRef };
        });
      });
    }
  }, [open, isEdit, workType, locationText]);

  // Auto-derive Survey Decision ref number from project number
  // e.g. SUR-2026-0001 -> 0001
  useEffect(() => {
    if (workType === 'SURVEY_DECISION' && projectNumber) {
      const parts = projectNumber.split('-');
      const seq = parts[parts.length - 1]; // last segment e.g. "0001"
      if (seq) {
        setMetadataObj((prev) => {
          // Only auto-fill if the field is empty or hasn't been manually changed
          // (i.e. it still looks like an auto-derived value: digits only)
          const current = prev.decisionNumber || '';
          const isAutoValue = current === '' || /^\d+$/.test(current);
          if (isAutoValue) {
            return { ...prev, decisionNumber: seq };
          }
          return prev;
        });
      }
    }
  }, [projectNumber, workType]);

  // Handle progress/status auto mapping helper
  const handleProgressChange = (val: number) => {
    setProgress(val);
    if (val === 0) setStatus('PENDING');
    else if (val < 50) setStatus('UNDER_PROCEDURE');
    else if (val < 100) setStatus('IN_PROGRESS');
    else setStatus('COMPLETED');
  };

  // Drag and drop attachment helper
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }
  };

  const handleOpenOneDrive = (e: React.MouseEvent) => {
    if (window.api && window.api.localDb && window.api.localDb.openOneDriveFolder) {
      e.preventDefault();
      window.api.localDb.openOneDriveFolder(projectName);
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const processFiles = async (files: File[]) => {
    const projId = currentProjectId || 'temp-id';
    const newAttachments: AttachmentItem[] = [];
    for (const f of files) {
      try {
        const buffer = await readFileAsArrayBuffer(f);
        const res = await window.api.localDb.saveAttachment(f.name, buffer, projId, projectName);
        newAttachments.push(res);
      } catch (err) {
        console.error('File copy failed', err);
      }
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleDeleteAttachment = async (item: AttachmentItem) => {
    try {
      await window.api.localDb.deleteAttachment(item.filePath);
      setAttachments((prev) => prev.filter((a) => a.id !== item.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAttachment = async (item: AttachmentItem) => {
    try {
      await window.api.localDb.openAttachment(item.filePath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation
    if (!projectName.trim()) {
      setError('Project name is required / اسم المشروع مطلوب');
      return;
    }

    if (!projectNumber.trim()) {
      setError('Project number is required / رقم المشروع مطلوب');
      return;
    }

    // Uniqueness validation
    try {
      const projs = (await window.api.localDb.getProjects()) as ProjectItem[];
      const dupe = projs.find((p) => p.projectNumber === projectNumber && p.id !== editProjectId);
      if (dupe) {
        setError(t('common.projectNumError'));
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Work-type specific validation
    if (workType === 'BALADI_TRANSACTION') {
      const requestNum = metadata.baladiRequestNumber || '';
      if (!/^1\d{11}$/.test(requestNum)) {
        setError('Baladi Request Number must be exactly 12 digits starting with 1 / رقم طلب بلدي يجب أن يتكون من 12 خانة ويبدأ بالرقم 1');
        return;
      }
      const year = metadata.transactionYear || '';
      if (!/^\d{4}$/.test(year)) {
        setError('Transaction Year must be exactly 4 digits / سنة المعاملة يجب أن تكون 4 أرقام');
        return;
      }
    }

    if (workType === 'SURVEY_SKETCH') {
      const area = parseFloat(metadata.totalArea || '');
      if (isNaN(area) || area <= 0) {
        setError('Total Area must be a positive numeric value / المساحة الإجمالية يجب أن تكون قيمة رقمية موجبة');
        return;
      }
    }

    if (workType === 'PRICE_OFFERS') {
      const price = parseFloat(metadata.totalPrice || '');
      if (isNaN(price) || price <= 0) {
        setError('Total Price must be a positive numeric value / السعر الإجمالي يجب أن يكون قيمة رقمية موجبة');
        return;
      }
    }

    let finalClientId = selectedClientId;

    // Register Inline Client if checked
    if (isNewClient) {
      if (!newClientName.trim()) {
        setError('Client name is required / اسم العميل مطلوب');
        return;
      }
      if (!newClientPhone.trim() || !/^(05\d{8}|\+9665\d{8})$/.test(newClientPhone)) {
        setError(t('common.invalidPhone'));
        return;
      }

      try {
        const clientUuid = crypto.randomUUID();
        const newClient: ClientItem = {
          id: clientUuid,
          tenantId: 't1111111',
          name: newClientName,
          phoneNumber: newClientPhone,
          notes: 'Inline project creation registration',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await window.api.localDb.upsertClient(newClient, true);
        finalClientId = clientUuid;
      } catch (err) {
        setError('Failed to create new client / فشل تسجيل العميل');
        console.error(err);
        return;
      }
    } else if (!selectedClientId) {
      setError('Please select a client / الرجاء اختيار العميل');
      return;
    }

    // 2. Perform Save
    try {
      const targetProjectId = currentProjectId;
      
      // Load current detailsJson to prevent overwriting auditLogs history or metadata
      let existingDetailsJson: ProjectDetailsJson = {};
      if (isEdit) {
        const currentDetails = (await window.api.localDb.getProjectDetails(targetProjectId)) as { detailsJson?: ProjectDetailsJson } | null;
        if (currentDetails && currentDetails.detailsJson) {
          existingDetailsJson = currentDetails.detailsJson as ProjectDetailsJson;
        }
      }

      const projectData: Omit<ProjectItem, 'clientName'> = {
        id: targetProjectId,
        tenantId: 't1111111',
        clientId: finalClientId,
        projectNumber,
        workType,
        status,
        progress,
        locationLat: locationLat ? Number(locationLat) : null,
        locationLng: locationLng ? Number(locationLng) : null,
        locationText,
        notes,
        createdAt: isEdit ? new Date().toISOString() : new Date().toISOString(), // system managed
        updatedAt: new Date().toISOString(),
      };

      let creatorName = '';
      try {
        const userStr = await window.api.secureStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          if (parsed && parsed.fullName) {
            creatorName = parsed.fullName;
          }
        }
      } catch (e) {
        console.error('Failed to get logged-in user profile', e);
      }

      await window.api.localDb.upsertProject(projectData, true);

      // Save attachment file list metadata and metadata values inside details JSON
      const detailsUuid = crypto.randomUUID();
      
      let quotationData = existingDetailsJson.quotation;
      if (workType === 'PRICE_OFFERS') {
        const inputPrice = parseFloat(metadata.totalPrice || '0') || 0;
        const finalClientObj = isNewClient ? { name: newClientName } : selectedClient;
        const clientDisplayName = finalClientObj?.name || '';
        
        if (!quotationData) {
          quotationData = {
            quotationDate: new Date().toISOString().split('T')[0],
            refNumber: metadata.offerNumber || projectNumber,
            clientName: clientDisplayName,
            toClientCompany: clientDisplayName,
            attentionTo: '',
            subject: projectName,
            introduction: isRtl
              ? `يسرنا أن نقدم لشركة/مؤسسة ${clientDisplayName || 'العميل الكريم'} عرضنا الفني والمالي المتكامل للقيام بـ "${projectName}".`
              : `We are pleased to submit our proposal for "${projectName}".`,
            scopeOfWork: [
              {
                id: '1',
                title: projectName || (isRtl ? 'الأعمال والخدمات المساحية والاستشارية' : 'Surveying & Engineering Services'),
                description: notes || (isRtl ? 'القيام بكافة الأعمال المساحية الميدانية وإعداد المخططات والتقارير الفنية المعتمدة.' : 'Complete technical surveying, field mapping, and engineering documentation.'),
                notes: locationText ? (isRtl ? `الموقع: ${locationText}` : `Location: ${locationText}`) : ''
              }
            ],
            pricingType: 'itemized',
            lumpSumPrice: inputPrice,
            items: [
              {
                id: '1',
                itemNo: '1',
                description: projectName || (isRtl ? 'أعمال استشارية ومساحية' : 'Engineering Consultancy & Surveying Works'),
                unit: isRtl ? 'مقطوع' : 'LS',
                quantity: 1,
                unitPrice: inputPrice,
                total: inputPrice
              }
            ],
            currency: 'SAR',
            discount: 0,
            vatRate: 15,
            executionDuration: metadata.executionDuration || (isRtl ? '30 يوم تقويمي' : '30 Calendar Days'),
            mobilizationPeriod: isRtl ? '7 أيام عمل' : '7 Calendar Days',
            deliveryTimeline: isRtl ? 'خلال المدة المتفق عليها من توقيع العقد' : 'Within agreed timeline',
            exclusions: isRtl
              ? [
                  'الرسوم الحكومية ورسوم استخراج التراخيص البلدية',
                  'أعمال فحص التربة والجسات الإنشائية',
                  'أعمال الحفر والردم وتجهيز الموقع الفعلي'
                ]
              : [
                  'Government fees & municipality permits',
                  'Third-party material testing',
                  'Site excavation and ground works'
                ],
            paymentTerms: metadata.paymentTerms ? [metadata.paymentTerms] : (isRtl
              ? [
                  '50% دفعة مقدمة عند توقيع الاتفاقية ومباشرة العمل',
                  '50% دفعة نهائية عند تسليم التقارير والمخططات النهائية'
                ]
              : [
                  '50% Advance Payment upon signing of proposal',
                  '50% Final Payment upon submission of survey report'
                ]),
            validityDays: parseInt(metadata.validityDays || '30', 10) || 30,
            termsConditions: {
              general: isRtl ? 'يتم تنفيذ الخدمات الاستشارية وفقاً للأصول الفنية والهندسية المتعارف عليها وكود البناء السعودي.' : 'The services will be conducted in accordance with professional engineering standards.',
              clientResponsibilities: isRtl ? 'يلتزم العميل بتسهيل الدخول للموقع وتوفير كافة مستندات ووثائق الملكية.' : 'Client shall provide access to the site and all necessary ownership documents.',
              consultantResponsibilities: isRtl ? 'يلتزم المكتب بتقديم التقارير الفنية والرسومات الهندسية الرقمية ضمن المدة المتفق عليها.' : 'Consultant shall deliver the digital CAD drawings and survey reports within the agreed timeline.',
              liabilityLimitations: isRtl ? 'تقتصر المسؤولية القانونية للمكتب على حدود قيمة أتعاب هذا العقد فقط.' : 'Consultant liability is limited to the contract value.',
              confidentiality: isRtl ? 'يلتزم الطرفان بالمحافظة التامة على سرية مستندات المشروع وبيانات العميل.' : 'Both parties agree to maintain strict confidentiality of all project documents.'
            },
            signatureSection: {
              preparedBy: isRtl ? 'إعداد: قسم المساحة' : 'Prepared By: Surveyor Dept.',
              reviewedBy: isRtl ? 'تدقيق: المدير الفني' : 'Reviewed By: Technical Director',
              approvedBy: isRtl ? 'اعتماد: المدير العام' : 'Approved By: General Manager',
              digitalSignature: true
            },
            branding: {
              companyName: isRtl ? 'دار مكة للاستشارات الهندسية' : 'Dar Makkah Engineering Consultations',
              address: isRtl ? 'مكة المكرمة، المملكة العربية السعودية' : 'Makkah Al Mukarramah, Saudi Arabia',
              phone: '+966 12 555 1234',
              email: 'info@darmakkah.com.sa',
              website: 'www.darmakkah.com.sa',
              crNumber: '4031087359',
              vatNumber: '300012345600003'
            },
            templateType: 'Engineering Consultancy',
            versionHistory: [
              { version: 1, updatedAt: new Date().toISOString(), updatedBy: creatorName || 'Admin', status: 'Draft', changes: 'Initial Price Offer Created' }
            ],
            currentStatus: 'Draft'
          };
        } else {
          quotationData = {
            ...quotationData,
            refNumber: metadata.offerNumber || projectNumber || quotationData.refNumber,
            clientName: clientDisplayName || quotationData.clientName,
            toClientCompany: clientDisplayName || quotationData.toClientCompany,
            subject: projectName || quotationData.subject,
          };
          if (inputPrice > 0 && quotationData.items && quotationData.items.length === 1) {
            quotationData.items[0].unitPrice = inputPrice;
            quotationData.items[0].total = inputPrice * (quotationData.items[0].quantity || 1);
            quotationData.items[0].description = projectName || quotationData.items[0].description;
            quotationData.lumpSumPrice = inputPrice;
          }
        }
      }

      await window.api.localDb.upsertProjectDetails(
        {
          id: detailsUuid,
          projectId: targetProjectId,
          workType,
          detailsJson: {
            ...existingDetailsJson,
            projectName,
            attachments,
            metadata,
            quotation: quotationData,
            createdBy: isEdit ? (existingDetailsJson.createdBy || creatorName) : creatorName,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        true
      );

      setSuccess('Project saved successfully / تم حفظ المشروع بنجاح');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError('Failed to save project / فشل حفظ المشروع');
      console.error(err);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const isRtl = t('common.language') === 'اللغة'; // simple indicator

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-bold">
            {isEdit
              ? `${t('common.edit')} ${t('common.projectNum')}: ${projectNumber}`
              : `${t('common.addProject')} - ${t(
                  `nav.${
                    workType === 'SURVEY_TRANSFER'
                      ? 'surveyTransfer'
                      : workType === 'REPORTS'
                      ? 'reports'
                      : workType === 'SURVEY_SKETCH'
                      ? 'surveySketch'
                      : workType === 'BALADI_TRANSACTION'
                      ? 'baladiTransactions'
                      : workType === 'SURVEY_DECISION'
                      ? 'surveyDecision'
                      : workType === 'PRICE_OFFERS'
                      ? 'priceOffers'
                      : workType
                  }`
                )}`}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm font-bold">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg border border-green-500/20 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('common.projectName')} *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Project Number */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('common.projectNum')} *
              </label>
              <input
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Client Selection Layer */}
          <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('common.client')} *
              </label>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-xs font-bold text-primary hover:underline"
              >
                {isNewClient ? t('common.cancel') : t('common.newClient')}
              </button>
            </div>

            {isNewClient ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    {t('common.clientName')} *
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    {t('common.clientPhone')} *
                  </label>
                  <input
                    type="text"
                    placeholder="05xxxxxxxx"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            ) : (
              /* Searchable dropdown picker */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                  className="w-full text-start px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary flex items-center justify-between"
                >
                  <span>{selectedClient ? selectedClient.name : 'Select Client / اختيار العميل'}</span>
                  <span className="text-xs text-muted-foreground">▼</span>
                </button>

                {clientDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-card border border-border rounded-xl shadow-lg p-2 z-30 max-h-48 overflow-y-auto space-y-2">
                    <input
                      type="text"
                      placeholder="Search client..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="w-full px-2.5 py-1 border border-border rounded-lg text-xs bg-background focus:outline-none"
                    />
                    <div className="space-y-1">
                      {filteredClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedClientId(c.id);
                            setClientDropdownOpen(false);
                          }}
                          className="w-full text-start px-2 py-1.5 text-xs rounded hover:bg-accent transition-all"
                        >
                          {c.name} ({c.phoneNumber})
                        </button>
                      ))}
                      {filteredClients.length === 0 && (
                        <div className="text-center text-xs text-muted-foreground py-2">No clients found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sequential Checklist Progress Logic */}
          <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-3">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.progress')} ({progress}%) - {t('common.status')}: {status}
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {(WORKFLOW_STEPS[workType] || []).map((step, idx) => {
                const stepsList = WORKFLOW_STEPS[workType] || [];
                const stepName = t(`steps.${workType}.${step.key}`);
                const isCompleted = progress >= step.percentage;
                
                // Sequential progression constraints
                const canCheck = idx === 0 ? true : progress >= stepsList[idx - 1].percentage;
                const canUncheck = idx === stepsList.length - 1 ? true : progress < stepsList[idx + 1].percentage;
                const isDisabled = isCompleted ? !canUncheck : !canCheck;

                return (
                  <label
                    key={step.key}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-semibold transition-all select-none ${
                      isCompleted 
                        ? 'border-green-200/30 bg-green-500/10 text-green-600 dark:text-green-400' 
                        : 'border-border bg-background text-muted-foreground'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleProgressChange(step.percentage);
                        } else {
                          const prevProgress = idx === 0 ? 0 : stepsList[idx - 1].percentage;
                          handleProgressChange(prevProgress);
                        }
                      }}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 accent-primary"
                    />
                    <span className="flex-1 truncate">{stepName}</span>
                    <span className="text-[10px] font-mono opacity-80">{step.percentage}%</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Work-Type Specific Metadata Form Fields */}
          <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2 mb-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                {workType}
              </span>
              <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                {isRtl ? 'بيانات نوع المشروع' : 'Work-Type Specific Metadata'}
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workType === 'SURVEY_TRANSFER' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.letterNumber')}</label>
                    <input
                      type="text"
                      value={metadata.letterNumber || ''}
                      onChange={(e) => updateMetadata('letterNumber', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.letterDate')}</label>
                    <input
                      type="date"
                      value={metadata.letterDate || ''}
                      onChange={(e) => updateMetadata('letterDate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.requestingAuthority')}</label>
                    <select
                      value={metadata.requestingAuthority || ''}
                      onChange={(e) => updateMetadata('requestingAuthority', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    >
                      <option value="">{isRtl ? 'اختر الجهة...' : 'Select Authority...'}</option>
                      <option value="Municipality">{t('authorities.Municipality')}</option>
                      <option value="Ministry">{t('authorities.Ministry')}</option>
                      <option value="Private">{t('authorities.Private')}</option>
                    </select>
                  </div>
                </>
              )}

              {workType === 'REPORTS' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.reportType')}</label>
                    <select
                      value={metadata.reportType || ''}
                      onChange={(e) => updateMetadata('reportType', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    >
                      <option value="">{isRtl ? 'اختر نوع التقرير...' : 'Select Report Type...'}</option>
                      <option value="Structural">{t('reportTypes.Structural')}</option>
                      <option value="Soil">{t('reportTypes.Soil')}</option>
                      <option value="Boundary">{t('reportTypes.Boundary')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.inspectorName')}</label>
                    <input
                      type="text"
                      value={metadata.inspectorName || ''}
                      onChange={(e) => updateMetadata('inspectorName', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                </>
              )}

              {workType === 'SURVEY_SKETCH' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.landUse')}</label>
                    <select
                      value={metadata.landUse || ''}
                      onChange={(e) => updateMetadata('landUse', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    >
                      <option value="">{isRtl ? 'اختر الاستخدام...' : 'Select Land Use...'}</option>
                      <option value="Residential">{t('landUses.Residential')}</option>
                      <option value="Commercial">{t('landUses.Commercial')}</option>
                      <option value="Industrial">{t('landUses.Industrial')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.totalArea')}</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={metadata.totalArea || ''}
                      onChange={(e) => updateMetadata('totalArea', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                </>
              )}

              {workType === 'BALADI_TRANSACTION' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.baladiRequestNumber')}</label>
                    <input
                      type="text"
                      placeholder="1xxxxxxxxxxx"
                      maxLength={12}
                      value={metadata.baladiRequestNumber || ''}
                      onChange={(e) => updateMetadata('baladiRequestNumber', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.transactionYear')}</label>
                    <input
                      type="text"
                      placeholder="2026"
                      maxLength={4}
                      value={metadata.transactionYear || ''}
                      onChange={(e) => updateMetadata('transactionYear', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    />
                  </div>
                </>
              )}

              {workType === 'SURVEY_DECISION' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                      {t('fields.decisionNumber')}
                      <span className="ms-2 text-[10px] font-normal text-primary/70 normal-case">
                        {isRtl ? '(مشتق تلقائياً من رقم المشروع)' : '(auto-derived from project #)'}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={metadata.decisionNumber || ''}
                      onChange={(e) => updateMetadata('decisionNumber', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                      placeholder={projectNumber ? projectNumber.split('-').at(-1) : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.decisionDate')}</label>
                    <input
                      type="date"
                      value={metadata.decisionDate || ''}
                      onChange={(e) => updateMetadata('decisionDate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.issuerName')}</label>
                    <input
                      type="text"
                      value={metadata.issuerName || ''}
                      onChange={(e) => updateMetadata('issuerName', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                </>
              )}

              {workType === 'PRICE_OFFERS' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'رقم عرض السعر' : 'Price Offer Number'}</label>
                    <input
                      type="text"
                      value={metadata.offerNumber || ''}
                      onChange={(e) => updateMetadata('offerNumber', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'المبلغ الإجمالي (غير شامل الضريبة)' : 'Total Price (VAT Excl.)'}</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={metadata.totalPrice || ''}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        const vat = price * 0.15;
                        const gTotal = price * 1.15;
                        updateMetadata('totalPrice', e.target.value);
                        updateMetadata('vatAmount', vat.toFixed(2));
                        updateMetadata('grandTotal', gTotal.toFixed(2));
                        updateMetadata('contractValue', gTotal.toFixed(2));

                        const paid = parseFloat(metadata.paidAmount || '0') || 0;
                        const rem = Math.max(0, gTotal - paid);
                        const pct = gTotal > 0 ? Math.min(100, (paid / gTotal) * 100).toFixed(1) : '0';
                        updateMetadata('remainingAmount', rem.toFixed(2));
                        updateMetadata('paymentPercentage', pct);
                      }}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'ضريبة القيمة المضافة (15%)' : 'VAT Amount (15%)'}</label>
                    <input
                      type="text"
                      disabled
                      value={metadata.vatAmount || '0.00'}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-muted text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'الإجمالي شامل الضريبة' : 'Grand Total (VAT Incl.)'}</label>
                    <input
                      type="text"
                      disabled
                      value={metadata.grandTotal || '0.00'}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-muted text-sm focus:outline-none font-bold text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.paidAmount') || 'المبلغ المدفوع (ر.س)'}</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={metadata.paidAmount || ''}
                      onChange={(e) => {
                        const paid = parseFloat(e.target.value) || 0;
                        const gTotal = parseFloat(metadata.grandTotal || '0') || 0;
                        const rem = Math.max(0, gTotal - paid);
                        const pct = gTotal > 0 ? Math.min(100, (paid / gTotal) * 100).toFixed(1) : '0';
                        updateMetadata('paidAmount', e.target.value);
                        updateMetadata('remainingAmount', rem.toFixed(2));
                        updateMetadata('paymentPercentage', pct);
                      }}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-semibold text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.paymentPercentage') || 'نسبة السداد (%)'}</label>
                    <input
                      type="number"
                      placeholder="0%"
                      min="0"
                      max="100"
                      step="1"
                      value={metadata.paymentPercentage || ''}
                      onChange={(e) => {
                        const pct = parseFloat(e.target.value) || 0;
                        const gTotal = parseFloat(metadata.grandTotal || '0') || 0;
                        const paid = (gTotal * pct) / 100;
                        const rem = Math.max(0, gTotal - paid);
                        updateMetadata('paymentPercentage', e.target.value);
                        updateMetadata('paidAmount', paid.toFixed(2));
                        updateMetadata('remainingAmount', rem.toFixed(2));
                      }}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.remainingAmount') || 'المبلغ المتبقي (ر.س)'}</label>
                    <input
                      type="text"
                      disabled
                      value={metadata.remainingAmount || '0.00'}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-muted text-sm focus:outline-none font-bold text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'ملخص العرض والعمل' : 'Scope / Notes'}</label>
                    <textarea
                      value={metadata.scopeSummary || ''}
                      onChange={(e) => updateMetadata('scopeSummary', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none h-20"
                    />
                  </div>
                </>
              )}

              {workType === 'CONTRACTS' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.contractNumber') || 'رقم العقد'}</label>
                    <input
                      type="text"
                      value={metadata.contractNumber || ''}
                      onChange={(e) => updateMetadata('contractNumber', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.contractValue') || 'قيمة العقد الإجمالية (ر.س)'}</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={metadata.contractValue || ''}
                      onChange={(e) => {
                        const totalVal = parseFloat(e.target.value) || 0;
                        updateMetadata('contractValue', e.target.value);
                        const paid = parseFloat(metadata.paidAmount || '0') || 0;
                        const rem = Math.max(0, totalVal - paid);
                        const pct = totalVal > 0 ? Math.min(100, (paid / totalVal) * 100).toFixed(1) : '0';
                        updateMetadata('remainingAmount', rem.toFixed(2));
                        updateMetadata('paymentPercentage', pct);
                      }}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-bold text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.paidAmount') || 'المبلغ المدفوع (ر.س)'}</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={metadata.paidAmount || ''}
                      onChange={(e) => {
                        const paid = parseFloat(e.target.value) || 0;
                        const totalVal = parseFloat(metadata.contractValue || '0') || 0;
                        const rem = Math.max(0, totalVal - paid);
                        const pct = totalVal > 0 ? Math.min(100, (paid / totalVal) * 100).toFixed(1) : '0';
                        updateMetadata('paidAmount', e.target.value);
                        updateMetadata('remainingAmount', rem.toFixed(2));
                        updateMetadata('paymentPercentage', pct);
                      }}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-semibold text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.paymentPercentage') || 'نسبة السداد (%)'}</label>
                    <input
                      type="number"
                      placeholder="0%"
                      min="0"
                      max="100"
                      step="1"
                      value={metadata.paymentPercentage || ''}
                      onChange={(e) => {
                        const pct = parseFloat(e.target.value) || 0;
                        const totalVal = parseFloat(metadata.contractValue || '0') || 0;
                        const paid = (totalVal * pct) / 100;
                        const rem = Math.max(0, totalVal - paid);
                        updateMetadata('paymentPercentage', e.target.value);
                        updateMetadata('paidAmount', paid.toFixed(2));
                        updateMetadata('remainingAmount', rem.toFixed(2));
                      }}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.remainingAmount') || 'المبلغ المتبقي (ر.س)'}</label>
                    <input
                      type="text"
                      disabled
                      value={metadata.remainingAmount || '0.00'}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-muted text-sm focus:outline-none font-bold text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('common.startDate') || 'تاريخ بداية العقد'}</label>
                    <input
                      type="date"
                      value={metadata.startDate || ''}
                      onChange={(e) => updateMetadata('startDate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('common.endDate') || 'تاريخ نهاية العقد'}</label>
                    <input
                      type="date"
                      value={metadata.endDate || ''}
                      onChange={(e) => updateMetadata('endDate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.paymentTerms') || 'شروط وتوزيع الدفعات'}</label>
                    <textarea
                      rows={2}
                      placeholder={isRtl ? 'مثال: 30% دفعة مقدمة عند التوقيع، 50% عند رفع الكروكي، 20% عند التسليم النهائي' : 'e.g. 30% down payment on signing, 50% on sketch draft, 20% on final handover'}
                      value={metadata.paymentTerms || ''}
                      onChange={(e) => updateMetadata('paymentTerms', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Financial Inputs Section for General Work Types */}
              {workType !== 'CONTRACTS' && workType !== 'PRICE_OFFERS' && (
                <div className="md:col-span-2 border-t border-border pt-4 mt-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span>💰</span>
                    <span>{isRtl ? 'البيانات المالية والأتعاب (المسدد والمتبقي)' : 'Financials & Fees (Paid & Remaining)'}</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'قيمة الأتعاب (ر.س)' : 'Fee Amount (SAR)'}</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={metadata.contractValue || ''}
                        onChange={(e) => {
                          const totalVal = parseFloat(e.target.value) || 0;
                          updateMetadata('contractValue', e.target.value);
                          const paid = parseFloat(metadata.paidAmount || '0') || 0;
                          const rem = Math.max(0, totalVal - paid);
                          const pct = totalVal > 0 ? Math.min(100, (paid / totalVal) * 100).toFixed(1) : '0';
                          updateMetadata('remainingAmount', rem.toFixed(2));
                          updateMetadata('paymentPercentage', pct);
                        }}
                        className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-bold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.paidAmount') || 'المبلغ المدفوع (ر.س)'}</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={metadata.paidAmount || ''}
                        onChange={(e) => {
                          const paid = parseFloat(e.target.value) || 0;
                          const totalVal = parseFloat(metadata.contractValue || '0') || 0;
                          const rem = Math.max(0, totalVal - paid);
                          const pct = totalVal > 0 ? Math.min(100, (paid / totalVal) * 100).toFixed(1) : '0';
                          updateMetadata('paidAmount', e.target.value);
                          updateMetadata('remainingAmount', rem.toFixed(2));
                          updateMetadata('paymentPercentage', pct);
                        }}
                        className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-semibold text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.paymentPercentage') || 'نسبة السداد (%)'}</label>
                      <input
                        type="number"
                        placeholder="0%"
                        min="0"
                        max="100"
                        step="1"
                        value={metadata.paymentPercentage || ''}
                        onChange={(e) => {
                          const pct = parseFloat(e.target.value) || 0;
                          const totalVal = parseFloat(metadata.contractValue || '0') || 0;
                          const paid = (totalVal * pct) / 100;
                          const rem = Math.max(0, totalVal - paid);
                          updateMetadata('paymentPercentage', e.target.value);
                          updateMetadata('paidAmount', paid.toFixed(2));
                          updateMetadata('remainingAmount', rem.toFixed(2));
                        }}
                        className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{t('fields.remainingAmount') || 'المبلغ المتبقي (ر.س)'}</label>
                      <input
                        type="text"
                        disabled
                        value={metadata.remainingAmount || '0.00'}
                        className="w-full px-3 py-1.5 border border-border rounded-lg bg-muted text-sm focus:outline-none font-bold text-amber-600 dark:text-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Text */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('common.locationText')}
              </label>
              <input
                type="text"
                placeholder="Riyadh, Olaya District"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Coordinates (Manual coordinates) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {t('common.latitude')}
                </label>
                <input
                  type="text"
                  placeholder="24.7136"
                  value={locationLat}
                  onChange={(e) => setLocationLat(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {t('common.longitude')}
                </label>
                <input
                  type="text"
                  placeholder="46.6753"
                  value={locationLng}
                  onChange={(e) => setLocationLng(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              {t('common.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary h-20"
            />
          </div>

          {/* File Attachments Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('common.attachments')}
              </label>
              <a
                href="https://1drv.ms/f/c/0a257d75be9315f7/IgClaRD1xDsZQrZQWBjQrqSxAcg5Cj0LnhDtzkCJ11pabj0?e=RmZiBI"
                target="_blank"
                rel="noreferrer"
                onClick={handleOpenOneDrive}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline"
              >
                🌐 {isRtl ? 'فتح في ون درايف' : 'Open in OneDrive'}
              </a>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/30 transition-all cursor-pointer relative"
            >
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadCloud className="h-8 w-8 text-muted-foreground animate-bounce" />
                <p className="text-sm font-semibold text-foreground">{t('common.dragDropMsg')}</p>
                <p className="text-xs text-muted-foreground">
                  {isRtl
                    ? 'يدعم ملفات أوتوكاد CAD (dwg, dxf) والبي دي إف PDF والصور بحجم يصل إلى 100 ميجابايت'
                    : 'Supports CAD (.dwg, .dxf), PDF, Images up to 100MB'}
                </p>
              </div>
            </div>

            {/* List of Attachments */}
            {attachments.length > 0 && (
              <div className="border border-border rounded-xl p-3 bg-card divide-y divide-border max-h-48 overflow-y-auto">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between py-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenAttachment(file)}
                      className="flex items-center gap-2 text-primary hover:underline font-medium truncate flex-1 text-start"
                    >
                      <FileUp className="h-4 w-4 shrink-0" />
                      <span className="truncate">{file.fileName}</span>
                      <span className="text-[10px] text-muted-foreground">({(file.sizeBytes / 1024).toFixed(1)} KB)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(file)}
                      className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-all ml-2 mr-2"
                      title={isRtl ? 'حذف المرفق' : 'Delete attachment'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/95 transition-all shadow-sm"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- CLIENTS MANAGEMENT VIEW -----------------

function ClientsDirectoryView() {
  const { t, i18n } = useTranslation();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Client add form state
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cNotes, setCNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Client edit form state
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const startEditClient = (client: ClientItem) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditPhone(client.phoneNumber);
    setEditNotes(client.notes || '');
    setEditError(null);
  };

  const loadData = async () => {
    try {
      const cList = await window.api.localDb.getClients();
      const pList = await window.api.localDb.getProjects();
      setClients(cList as ClientItem[]);
      setProjects(pList as ProjectItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cName.trim()) {
      setError('Client name is required / اسم العميل مطلوب');
      return;
    }
    if (!cPhone.trim() || !/^(05\d{8}|\+9665\d{8})$/.test(cPhone)) {
      setError(t('common.invalidPhone'));
      return;
    }

    try {
      const clientUuid = crypto.randomUUID();
      const newClient: ClientItem = {
        id: clientUuid,
        tenantId: 't1111111',
        name: cName,
        phoneNumber: cPhone,
        notes: cNotes || 'Created directly in directory',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await window.api.localDb.upsertClient(newClient, true);
      setCName('');
      setCPhone('');
      setCNotes('');
      setAddClientOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to create client / فشل تسجيل العميل');
      console.error(err);
    }
  };

  const getLinkedProjectsCount = (clientId: string) => {
    return projects.filter((p) => p.clientId === clientId).length;
  };

  const [deleteClientTarget, setDeleteClientTarget] = useState<ClientItem | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);

  const handleDeleteClient = async () => {
    if (!deleteClientTarget) return;
    setIsDeletingClient(true);
    try {
      await window.api.localDb.deleteClient(deleteClientTarget.id, true);
      setDeleteClientTarget(null);
      loadData();
    } catch (err) {
      console.error(err);
      const errorMsg = isRtl
        ? 'لا يمكن حذف العميل بسبب وجود مشاريع نشطة مرتبطة به / Cannot delete client due to active/linked projects'
        : 'Cannot delete client due to active/linked projects';
      alert(errorMsg);
    } finally {
      setIsDeletingClient(false);
    }
  };

  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editingClient) return;

    if (!editName.trim()) {
      setEditError('Client name is required / اسم العميل مطلوب');
      return;
    }
    if (!editPhone.trim() || !/^(05\d{8}|\+9665\d{8})$/.test(editPhone)) {
      setEditError(t('common.invalidPhone'));
      return;
    }

    try {
      const updatedClient: ClientItem = {
        ...editingClient,
        name: editName,
        phoneNumber: editPhone,
        notes: editNotes,
        updatedAt: new Date().toISOString(),
      };
      await window.api.localDb.upsertClient(updatedClient, true);
      setEditingClient(null);
      loadData();
    } catch (err) {
      setEditError('Failed to update client / فشل تعديل العميل');
      console.error(err);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search)
  );

  const isRtl = i18n.language === 'ar';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder={isRtl ? 'البحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Add Client Trigger */}
        <button
          onClick={() => setAddClientOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{t('common.newClient')}</span>
        </button>
      </div>

      {/* Clients list table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider text-start">
              <th className="px-6 py-3 text-start">{t('common.clientName')}</th>
              <th className="px-6 py-3 text-start">{t('common.clientPhone')}</th>
              <th className="px-6 py-3 text-start">{t('common.projectCount')}</th>
              <th className="px-6 py-3 text-start">{t('common.dateAdded')}</th>
              <th className="px-6 py-3 text-center w-24">{isRtl ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-muted/20 transition-all">
                <td className="px-6 py-4 font-bold text-foreground">{client.name}</td>
                <td className="px-6 py-4 text-muted-foreground font-mono">{client.phoneNumber}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-xs">
                    {getLinkedProjectsCount(client.id)}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs">
                  {new Date(client.createdAt).toLocaleDateString(i18n.language)}
                </td>
                <td className="px-6 py-4 text-center flex items-center justify-center gap-1">
                  <button
                    onClick={() => startEditClient(client)}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title={isRtl ? 'تعديل العميل' : 'Edit Client'}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteClientTarget(client)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title={isRtl ? 'حذف العميل' : 'Delete Client'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  No clients registered yet / لا يوجد عملاء مسجلين
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Client Dialog Modal */}
      {addClientOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-bold">{t('common.newClient')}</h3>
              <p className="text-xs text-muted-foreground">{isRtl ? 'تسجيل تفاصيل العميل الجديد في قاعدة البيانات المحلية.' : 'Register client details in the offline database.'}</p>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('common.clientName')} *</label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('common.clientPhone')} *</label>
                <input
                  type="text"
                  placeholder="05xxxxxxxx"
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('common.notes')}</label>
                <textarea
                  value={cNotes}
                  onChange={(e) => setCNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddClientOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/95"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Dialog Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-bold">{isRtl ? 'تعديل بيانات العميل' : 'Edit Client Details'}</h3>
              <p className="text-xs text-muted-foreground">{isRtl ? 'تحديث بيانات العميل في قاعدة البيانات المحلية.' : 'Update client details in the offline database.'}</p>
            </div>

            {editError && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20 font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('common.clientName')} *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('common.clientPhone')} *</label>
                <input
                  type="text"
                  placeholder="05xxxxxxxx"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('common.notes')}</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/95"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------- PROJECTS LIST VIEW (GRID) -----------------

function ProjectListView({ workTypeFilter }: { workTypeFilter?: string }) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal Trigger
  const [formOpen, setFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | undefined>(undefined);
  const [formWorkType, setFormWorkType] = useState<string>('SURVEY_TRANSFER');

  // Active filters in state
  const statusFilter = searchParams.get('status') || '';
  const selectedWorkType = workTypeFilter || searchParams.get('workType') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const searchQuery = searchParams.get('q') || '';

  // Dashboard router addType checker
  const addTypeParam = searchParams.get('addType');

  useEffect(() => {
    if (addTypeParam) {
      setSearchParams((prev) => {
        prev.delete('addType');
        return prev;
      });
      setIsEdit(false);
      setFormWorkType(addTypeParam);
      setFormOpen(true);
    }
  }, [addTypeParam, setSearchParams]);

  const [projectDetailsMap, setProjectDetailsMap] = useState<Record<string, ProjectDetailsJson>>({});

  const loadProjects = async () => {
    try {
      const [data, clientData] = await Promise.all([
        window.api.localDb.getProjects(),
        window.api.localDb.getClients(),
      ]);
      const clientEntries: [string, string][] = (clientData as ClientItem[]).map(
        (c) => [c.id, c.name]
      );
      const clientLookup: Record<string, string> = {};
      for (const [id, name] of clientEntries) {
        clientLookup[id] = name;
      }
      const enriched = (data as ProjectItem[]).map((p) => ({
        ...p,
        clientName: p.clientName || clientLookup[p.clientId] || '',
      }));

      const detailsMap: Record<string, ProjectDetailsJson> = {};
      await Promise.all(
        enriched.map(async (p) => {
          const det = (await window.api.localDb.getProjectDetails(p.id)) as { detailsJson?: ProjectDetailsJson } | null;
          if (det && det.detailsJson) {
            detailsMap[p.id] = det.detailsJson;
          }
        })
      );

      setProjects(enriched);
      setProjectDetailsMap(detailsMap);
    } catch (error) {
      console.error('Failed to load projects from local DB:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchParams((prev) => {
      prev.delete('status');
      prev.delete('workType');
      prev.delete('startDate');
      prev.delete('endDate');
      prev.delete('q');
      return prev;
    });
  };

  const [deleteProjectTarget, setDeleteProjectTarget] = useState<ProjectItem | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const handleDeleteProject = async () => {
    if (!deleteProjectTarget) return;
    setIsDeletingProject(true);
    try {
      await window.api.localDb.deleteProject(deleteProjectTarget.id, true);
      setDeleteProjectTarget(null);
      await loadProjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to delete project:', msg);
      alert((i18n.language === 'ar' ? 'فشل حذف المشروع:\n' : 'Failed to delete project:\n') + msg);
    } finally {
      setIsDeletingProject(false);
    }
  };

  // Get active step label helper
  const getActiveStepLabel = (pWorkType: string, pProgress: number) => {
    const step = getActiveStep(pWorkType, pProgress);
    if (!step) return t('status.pending');
    return t(`steps.${pWorkType}.${step.key}`);
  };

  // Combined filters
  const filteredProjects = projects.filter((project) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = project.projectName?.toLowerCase().includes(query);
      const clientMatch = project.clientName?.toLowerCase().includes(query);
      const numberMatch = project.projectNumber?.toLowerCase().includes(query);
      if (!nameMatch && !clientMatch && !numberMatch) return false;
    }

    if (selectedWorkType && project.workType !== selectedWorkType) return false;
    if (statusFilter && project.status !== statusFilter) return false;

    if (project.createdAt) {
      const projDate = new Date(project.createdAt).getTime();
      if (startDate && projDate < new Date(startDate).getTime()) return false;
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        if (projDate > endDateTime.getTime()) return false;
      }
    }

    return true;
  });

  const hasActiveFilters = statusFilter || selectedWorkType || startDate || endDate || searchQuery;

  const isRtl = i18n.language === 'ar';
  const totalCount = filteredProjects.length;
  const totalValue = filteredProjects.reduce((acc, p) => {
    const meta = projectDetailsMap[p.id]?.metadata || {};
    const val = parseFloat(meta.contractValue || meta.grandTotal || meta.totalPrice || '0') || 0;
    return acc + val;
  }, 0);

  const totalPaid = filteredProjects.reduce((acc, p) => {
    const meta = projectDetailsMap[p.id]?.metadata || {};
    const val = parseFloat(meta.paidAmount || '0') || 0;
    return acc + val;
  }, 0);

  const totalRemaining = filteredProjects.reduce((acc, p) => {
    const meta = projectDetailsMap[p.id]?.metadata || {};
    const rem = parseFloat(meta.remainingAmount || '0');
    if (!isNaN(rem) && meta.remainingAmount !== undefined) return acc + rem;
    const tot = parseFloat(meta.contractValue || meta.grandTotal || meta.totalPrice || '0') || 0;
    const pd = parseFloat(meta.paidAmount || '0') || 0;
    return acc + Math.max(0, tot - pd);
  }, 0);

  const overallPaidPct = totalValue > 0 ? ((totalPaid / totalValue) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Metrics Summary Row */}
      {totalValue > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المشاريع' : 'Total Work Count'}</span>
            <div className="text-2xl font-black text-foreground">{totalCount}</div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي قيمة الأعمال (ر.س)' : 'Total Work Value (SAR)'}</span>
            <div className="text-2xl font-black text-primary font-mono">
              {totalValue.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المحصل / المدفوع' : 'Total Paid (SAR)'}</span>
              <span className="text-[10px] font-extrabold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">{overallPaidPct}%</span>
            </div>
            <div className="text-2xl font-black text-green-600 dark:text-green-400 font-mono">
              {totalPaid.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المتبقي (ر.س)' : 'Total Remaining Dues (SAR)'}</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {totalRemaining.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Filter className="h-4 w-4" />
          <span>{i18n.language === 'ar' ? 'تصفية' : 'Filters'}</span>
        </div>

        {/* Search */}
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <span className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="w-full ps-8 pe-3 py-1 border border-border rounded-lg bg-background text-xs focus:outline-none"
          />
        </div>

        {/* Work Type (Dashboard only) */}
        {!workTypeFilter && (
          <select
            value={selectedWorkType}
            onChange={(e) => handleFilterChange('workType', e.target.value)}
            className="px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          >
            <option value="">{t('common.allWorkTypes')}</option>
            <option value="SURVEY_TRANSFER">{t('nav.surveyTransfer')}</option>
            <option value="REPORTS">{t('nav.reports')}</option>
            <option value="SURVEY_SKETCH">{t('nav.surveySketch')}</option>
            <option value="BALADI_TRANSACTION">{t('nav.baladiTransactions')}</option>
            <option value="SURVEY_DECISION">{t('nav.surveyDecision')}</option>
            <option value="PRICE_OFFERS">{t('nav.priceOffers')}</option>
          </select>
        )}

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        >
          <option value="">{t('common.allStatuses')}</option>
          <option value="PENDING">{t('status.pending')}</option>
          <option value="UNDER_PROCEDURE">{t('status.underProcedure')}</option>
          <option value="IN_PROGRESS">{t('status.inProgress')}</option>
          <option value="COMPLETED">{t('status.completed')}</option>
        </select>

        {/* Start Date */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground">{t('common.startDate')}</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="px-2.5 py-1 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground">{t('common.endDate')}</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="px-2.5 py-1 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg hover:bg-secondary/80 border border-border shadow-sm"
          >
            {i18n.language === 'ar' ? 'إعادة تعيين' : 'Clear'}
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="border border-border border-dashed p-12 text-center rounded-xl bg-card shadow-sm flex flex-col items-center justify-center space-y-3">
          <FolderOpen className="h-12 w-12 text-muted-foreground" />
          <h4 className="font-bold text-md text-foreground">{t('common.noProjects')}</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            {i18n.language === 'ar'
              ? 'لا توجد مشاريع مسجلة حالياً تطابق معايير التصفية المحددة.'
              : 'No surveying projects matched the filters or search terms.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="border border-border p-5 rounded-xl bg-card hover:shadow-md transition-all shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                    {project.workType}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {project.projectNumber}
                  </span>
                </div>

                <h4 className="font-bold text-foreground truncate">{project.projectName || 'Project / مشروع'}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-muted-foreground/80">{t('common.client')}: </span>
                  {project.clientName || <span className="italic opacity-60">—</span>}
                </p>

                {project.locationText && (
                  <p className="text-[11px] text-muted-foreground truncate mt-1">
                    <span className="font-semibold text-muted-foreground/80">📍 </span>
                    {project.locationText}
                  </p>
                )}

                {/* Card Financial Summary Badge */}
                {(() => {
                  const meta = projectDetailsMap[project.id]?.metadata || {};
                  const tot = parseFloat(meta.contractValue || meta.grandTotal || meta.totalPrice || '0') || 0;
                  const pd = parseFloat(meta.paidAmount || '0') || 0;
                  const rem = parseFloat(meta.remainingAmount || String(Math.max(0, tot - pd))) || 0;
                  const pct = meta.paymentPercentage || (tot > 0 ? ((pd / tot) * 100).toFixed(0) : '0');

                  if (tot <= 0 && pd <= 0) return null;

                  return (
                    <div className="mt-2.5 bg-muted/20 border border-border/60 p-2 rounded-lg space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground font-medium">{isRtl ? 'الإجمالي:' : 'Total:'}</span>
                        <span className="font-bold font-mono text-foreground">{tot.toLocaleString(i18n.language)} ر.س</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground font-medium">{isRtl ? 'المدفوع:' : 'Paid:'}</span>
                        <span className="font-bold font-mono text-green-600 dark:text-green-400">
                          {pd.toLocaleString(i18n.language)} ر.س ({pct}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] border-t border-border/40 pt-1">
                        <span className="text-muted-foreground font-medium">{isRtl ? 'المتبقي:' : 'Remaining:'}</span>
                        <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                          {rem > 0 ? `${rem.toLocaleString(i18n.language)} ر.س` : (isRtl ? 'خالص' : 'Paid')}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-5 space-y-3">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-foreground truncate max-w-[70%]">{getActiveStepLabel(project.workType, project.progress)}</span>
                    <span className="font-bold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[10px] text-muted-foreground">
                    {t('common.dateAdded')}: {project.createdAt ? new Date(project.createdAt).toLocaleDateString(i18n.language) : ''}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <Link
                      to={`/project/${project.id}`}
                      className="p-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg border border-border transition-all shadow-sm"
                      title={i18n.language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => {
                        setIsEdit(true);
                        setEditProjectId(project.id);
                        setFormWorkType(project.workType);
                        setFormOpen(true);
                      }}
                      className="p-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg border border-border transition-all shadow-sm"
                      title={i18n.language === 'ar' ? 'تعديل المشروع' : 'Edit Project'}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => alert(i18n.language === 'ar' ? 'جاري تصدير ملف PDF...' : 'Exporting PDF...')}
                      className="p-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg border border-border transition-all shadow-sm"
                      title={i18n.language === 'ar' ? 'تصدير المشروع' : 'Export Project'}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteProjectTarget(project)}
                      className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg border border-red-500/30 transition-all shadow-sm"
                      title={i18n.language === 'ar' ? 'حذف المشروع' : 'Delete Project'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Form Modal (Add/Edit) */}
      <ProjectFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        isEdit={isEdit}
        editProjectId={editProjectId}
        workTypeArg={formWorkType}
        onSuccess={loadProjects}
      />

      {/* Modern Confirm Delete Modal for Projects */}
      <ConfirmModal
        isOpen={!!deleteProjectTarget}
        title={isRtl ? 'تأكيد حذف المشروع' : 'Confirm Delete Project'}
        message={isRtl ? 'هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذه العملية.' : 'Are you sure you want to delete this project? This cannot be undone.'}
        itemName={deleteProjectTarget ? (projectDetailsMap[deleteProjectTarget.id]?.projectName || deleteProjectTarget.projectName || deleteProjectTarget.clientName) : ''}
        itemBadge={deleteProjectTarget?.projectNumber}
        description={deleteProjectTarget?.locationText ? (isRtl ? `الموقع: ${deleteProjectTarget.locationText}` : `Location: ${deleteProjectTarget.locationText}`) : undefined}
        isLoading={isDeletingProject}
        onConfirm={handleDeleteProject}
        onClose={() => setDeleteProjectTarget(null)}
      />
    </div>
  );
}

// Edit Icon helper (avoiding build issues)
function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  );
}

// 3. Dashboard
export function DashboardPage(): React.ReactElement {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'projects' | 'clients'>('projects');

  return (
    <PlaceholderWrapper title={t('nav.dashboard')} icon={LayoutDashboard}>
      <div className="space-y-6">
        {/* Navigation Tabs Switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'projects'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('common.projects')}
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'clients'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('common.clients')}
          </button>
        </div>

        {activeTab === 'projects' ? <ProjectListView /> : <ClientsDirectoryView />}
      </div>
    </PlaceholderWrapper>
  );
}

// 4. Survey Transfer
export function SurveyTransferPage(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <PlaceholderWrapper title={t('nav.surveyTransfer')} icon={FileSpreadsheet} currentWorkType="SURVEY_TRANSFER">
      <ProjectListView workTypeFilter="SURVEY_TRANSFER" />
    </PlaceholderWrapper>
  );
}

// 5. Reports
export function ReportsPage(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <PlaceholderWrapper title={t('nav.reports')} icon={FileText} currentWorkType="REPORTS">
      <ProjectListView workTypeFilter="REPORTS" />
    </PlaceholderWrapper>
  );
}

// 6. Survey Sketch
export function SurveySketchPage(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <PlaceholderWrapper title={t('nav.surveySketch')} icon={Map} currentWorkType="SURVEY_SKETCH">
      <ProjectListView workTypeFilter="SURVEY_SKETCH" />
    </PlaceholderWrapper>
  );
}

// 7. Baladi Transactions
export function BaladiTransactionsPage(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <PlaceholderWrapper title={t('nav.baladiTransactions')} icon={Link2} currentWorkType="BALADI_TRANSACTION">
      <ProjectListView workTypeFilter="BALADI_TRANSACTION" />
    </PlaceholderWrapper>
  );
}

// 8. Survey Decision
export function SurveyDecisionPage(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <PlaceholderWrapper title={t('nav.surveyDecision')} icon={FileSignature} currentWorkType="SURVEY_DECISION">
      <ProjectListView workTypeFilter="SURVEY_DECISION" />
    </PlaceholderWrapper>
  );
}

// 8.5 Price Offers
export function PriceOffersPage(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <PlaceholderWrapper title={t('nav.priceOffers')} icon={Coins} currentWorkType="PRICE_OFFERS">
      <ProjectListView workTypeFilter="PRICE_OFFERS" />
    </PlaceholderWrapper>
  );
}

const TEMPLATE_DEFAULTS: Record<string, any> = {
  'Engineering Consultancy': {
    introduction: 'We are pleased to submit our proposal for providing general Engineering Consultancy services for your esteemed project.',
    scopeOfWork: [
      { id: '1', title: 'Consultation & Preliminary Assessment', description: 'Review site documents, soil reports, and define primary engineering requirements.', notes: 'Client must provide ownership documents.' },
      { id: '2', title: 'Technical Reporting', description: 'Prepare comprehensive technical assessment reports detailing feasibility, site constraints, and recommendations.', notes: 'Report will be submitted in English & Arabic.' }
    ],
    exclusions: ['Government permits & application fees', 'Third-party specialist consulting', 'Boundary mapping / land registry deeds'],
    paymentTerms: ['40% Advance Payment upon mobilization', '60% Final Payment upon submission of the final report'],
    termsConditions: {
      general: 'Consultancy is conducted under professional engineering standards.',
      clientResponsibilities: 'Client shall provide complete and accurate property data.',
      consultantResponsibilities: 'Consultant shall deliver findings in writing within the schedule.',
      liabilityLimitations: 'Liability is limited to the fees paid.',
      confidentiality: 'Strict confidentiality of project data will be maintained.'
    }
  },
  'Design Services': {
    introduction: 'We are pleased to submit our proposal for providing Architectural & Structural Design Services for your project.',
    scopeOfWork: [
      { id: '1', title: 'Architectural Concept Design', description: 'Develop initial floor plans, elevations, and 3D perspectives for client review.', notes: 'Includes up to 3 revisions.' },
      { id: '2', title: 'Structural & MEP Detailed Engineering', description: 'Complete detailed structural calculations, concrete design, electrical, HVAC, and plumbing drawings.', notes: 'Drawings will be stamped for Municipality approval.' }
    ],
    exclusions: ['Soil investigation and geotechnical drilling', 'Municipality submission fees', 'Interior design renderings (unless added as extra)'],
    paymentTerms: ['30% Advance Payment upon signing', '40% Upon approval of Concept Design', '30% Upon delivery of final Municipality drawings'],
    termsConditions: {
      general: 'All designs conform to the Saudi Building Code (SBC).',
      clientResponsibilities: 'Client to provide site contours and topographic maps.',
      consultantResponsibilities: 'Consultant to ensure structural stability and municipality compliance.',
      liabilityLimitations: 'Liability capped at design fee amount.',
      confidentiality: 'Design copyrights belong to Dar Makkah until final payment.'
    }
  },
  'Supervision Services': {
    introduction: 'We are pleased to submit our proposal for Construction Supervision Services to monitor compliance and quality at the site.',
    scopeOfWork: [
      { id: '1', title: 'Site Inspection & Engineering Review', description: 'Conduct regular visits to inspect steel reinforcements, concrete casting, and finishes.', notes: 'Includes issuing inspection reports.' },
      { id: '2', title: 'Contractor Work Approval', description: 'Review contractor invoices, material submittals, and test results.', notes: 'Consultant acts as Client technical representative.' }
    ],
    exclusions: ['Site safety coordination (unless contracted)', 'Contractor progress scheduling', 'Direct procurement of materials'],
    paymentTerms: ['Monthly progress billing based on site visits', 'Retainer equal to 1 month fees due upon mobilization'],
    termsConditions: {
      general: 'Supervision focuses on construction compliance, not contractor performance.',
      clientResponsibilities: 'Client shall facilitate access and notify inspector of milestones.',
      consultantResponsibilities: 'Consultant shall reject non-compliant works.',
      liabilityLimitations: 'No liability for contractor delays or construction defects.',
      confidentiality: 'All site records remain confidential.'
    }
  },
  'Quantity Surveying': {
    introduction: 'We are pleased to submit our quotation for providing Bill of Quantities (BOQ) and Quantity Surveying services.',
    scopeOfWork: [
      { id: '1', title: 'Take-off and Measurement', description: 'Extract quantities from architectural, structural, and MEP drawing sets.', notes: 'Using international measurement standards.' },
      { id: '2', title: 'BOQ Preparation & Cost Estimation', description: 'Compile detailed priced and unpriced Bills of Quantities and cost estimates.', notes: 'Provided in editable Microsoft Excel format.' }
    ],
    exclusions: ['Verification of actual site quantities during build', 'Resolving drawing discrepancy errors', 'Tender evaluation (unless requested)'],
    paymentTerms: ['50% Advance Payment', '50% Upon submission of final BOQ Excel file'],
    termsConditions: {
      general: 'Quantities are calculated from the provided design sets only.',
      clientResponsibilities: 'Client must provide the latest issued-for-tender (IFT) drawing set.',
      consultantResponsibilities: 'Consultant will ensure accuracy of BOQ measurements.',
      liabilityLimitations: 'Maximum liability is 50% of the QS service contract value.',
      confidentiality: 'Project costing database remains confidential.'
    }
  },
  'Project Management': {
    introduction: 'We are pleased to submit our proposal for comprehensive Project Management Services to manage the project constraints.',
    scopeOfWork: [
      { id: '1', title: 'Project Planning & Scheduling', description: 'Create project master schedule, risk register, and cost management plan.', notes: 'Using Primavera or MS Project.' },
      { id: '2', title: 'Tender Management & Selection', description: 'Manage tender process, evaluate contractor bids, and recommend selection.', notes: 'Objective comparison report provided.' }
    ],
    exclusions: ['Direct supervision on site (supervision contract separate)', 'Handling contractor dispute litigation', 'Acting as prime contractor'],
    paymentTerms: ['20% Mobilization payment', 'Equal monthly installments over the planned project duration'],
    termsConditions: {
      general: 'PM services manage coordination, not direct construction execution.',
      clientResponsibilities: 'Client to provide timely approvals on budget and schedules.',
      consultantResponsibilities: 'PM shall report project status monthly.',
      liabilityLimitations: 'Consultant is not liable for contractor default.',
      confidentiality: 'Tender bids and costs kept strictly confidential.'
    }
  }
};

const TEMPLATE_DEFAULTS_AR: Record<string, any> = {
  'Engineering Consultancy': {
    introduction: 'يسرنا أن نقدم لكم عرضنا الفني والمالي الخاص بتقديم الخدمات الاستشارية الهندسية لمشروعكم الموقر.',
    scopeOfWork: [
      { id: '1', title: 'المراجعة والتقييم الأولي', description: 'دراسة مستندات الموقع وتقارير التربة وتحديد المتطلبات الهندسية الرئيسية للمشروع.', notes: 'يلتزم العميل بتقديم صك الملكية والكروكي التنظيمي.' },
      { id: '2', title: 'إعداد وتدقيق التقارير الفنية', description: 'إعداد تقرير فني شامل يوضح الجدوى الهندسية ومحددات الموقع والتوصيات الفنية اللازمة.', notes: 'سيتم تسليم التقرير باللغتين العربية والإنجليزية.' }
    ],
    exclusions: ['الرسوم الحكومية ورسوم استخراج تراخيص البلدية', 'أعمال فحص التربة والجسات المخبرية', 'أي استشارات متخصصة لم يذكر نطاقها صراحة'],
    paymentTerms: ['40% دفعة مقدمة عند توقيع العقد والبدء في العمل', '60% دفعة نهائية عند تسليم التقارير واعتمادها'],
    termsConditions: {
      general: 'يتم تنفيذ كافة الخدمات الاستشارية وفقاً لأعلى المعايير والأصول الهندسية المهنية.',
      clientResponsibilities: 'يلتزم العميل بتسهيل الدخول للموقع وتوفير كافة بيانات ومخططات العقار.',
      consultantResponsibilities: 'يلتزم المكتب بتقديم النتائج والتوصيات المكتوبة ضمن المدد المتفق عليها.',
      liabilityLimitations: 'تقتصر المسؤولية القانونية للمكتب على حدود قيمة أتعاب العقد فقط.',
      confidentiality: 'يلتزم الطرفان بالمحافظة التامة على سرية المعلومات والوثائق المتبادلة.'
    }
  },
  'Design Services': {
    introduction: 'يسرنا أن نقدم لكم عرضنا الفني والمالي لتقديم خدمات التصميم المعماري والإنشائي وإعداد المخططات الهندسية للمشروع.',
    scopeOfWork: [
      { id: '1', title: 'التصميم المعماري المبدئي واختيار الفكرة', description: 'تطوير مساقط الطوابق والواجهات المعمارية والمنظور ثلاثي الأبعاد وعرضها على العميل للمراجعة والتعديل.', notes: 'يشمل العرض ما يصل إلى 3 جولات تعديل مجانية.' },
      { id: '2', title: 'المخططات التنفيذية التفصيلية (الإنشائية والكهروميكانيكية)', description: 'إعداد المخططات الإنشائية والحسابات الإنشائية التفصيلية، ومخططات الكهرباء والسباكة والتكييف والصرف الصحي المعتمدة لتقديم التراخيص.', notes: 'تطابق المخططات كود البناء السعودي SBC.' }
    ],
    exclusions: ['تكاليف فحص التربة والرفع المساحي الميداني', 'رسوم إصدار رخص البناء أو التوثيق في المنصات الحكومية', 'أعمال الإشراف الهندسي على التنفيذ'],
    paymentTerms: ['30% دفعة مقدمة عند توقيع الاتفاقية', '40% بعد اعتماد الفكرة والتصميم المعماري المبدئي', '30% عند تسليم المخططات النهائية والتفصيلية جاهزة للرخصة'],
    termsConditions: {
      general: 'جميع التصاميم تعد ملكاً فكرياً للمكتب حتى سداد كامل مستحقات العقد.',
      clientResponsibilities: 'يلتزم العميل بتزويد المكتب بتقرير فحص التربة المعتمد والرفع المساحي للموقع.',
      consultantResponsibilities: 'يضمن المكتب مطابقة المخططات للاشتراطات الفنية لبلدية مكة المكرمة والأكواد المعتمدة.',
      liabilityLimitations: 'تقتصر مسؤولية التصميم على سلامة الحسابات الإنشائية والمعمارية المعتمدة.',
      confidentiality: 'يتم التعامل مع تصاميم ومخططات العميل بسرية تامة.'
    }
  },
  'Supervision Services': {
    introduction: 'يسرنا تقديم عرضنا الهندسية والمالي لخدمات الإشراف الفني على أعمال التنفيذ والبناء في الموقع.',
    scopeOfWork: [
      { id: '1', title: 'المطابقة وأعمال حديد التسليح واستلام الصبات', description: 'القيام بزيارات ميدانية مجدولة لفحص أعمال حديد التسليح ومطابقتها للمخططات المعتمدة قبل صب الخرسانة وإصدار تقارير الاستلام.', notes: 'يتم إشعار المهندس بموعد الصب بـ 24 ساعة على الأقل.' },
      { id: '2', title: 'اعتماد المواد ومطابقة عينات مقاول التنفيذ', description: 'مراجعة واعتماد عينات ومواصفات مواد التشطيب والبناء المقدمة من المقاول وإبداء الرأي الفني فيها.', notes: 'يشمل مراجعة نتائج اختبار كسر المكعبات الخرسانية.' }
    ],
    exclusions: ['توفير مهندس مقيم دائم في الموقع (الإشراف بنظام الزيارات)', 'مسؤولية سلامة العمال وتوفير وسائل الأمان بالموقع (مسؤولية المقاول)', 'التنسيق المباشر أو التوجيه للعمال وصرف مستحقاتهم'],
    paymentTerms: ['دفعة شهرية ثابتة بناءً على عدد الزيارات الميدانية المتفق عليها', 'دفعة مقدمة تعادل أتعاب شهر واحد كضمان تشغيل ومباشرة الإشراف'],
    termsConditions: {
      general: 'يركز الإشراف على مطابقة المواد والتنفيذ الفني للمخططات المعتمدة.',
      clientResponsibilities: 'يلتزم العميل بإبلاغ المهندس بمواعيد الاستلامات في الوقت المناسب وتسهيل دخوله للموقع.',
      consultantResponsibilities: 'يلتزم الاستشاري بإعداد تقارير فنية ورفعها على منصة بلدي فور الانتهاء من كل مرحلة.',
      liabilityLimitations: 'لا يتحمل المكتب مسؤولية أي أخطاء تنفيذية يرتكبها المقاول في غياب المهندس.',
      confidentiality: 'جميع تقارير المعاينة والاستلام تسلم للعميل فقط.'
    }
  },
  'Quantity Surveying': {
    introduction: 'يسرنا تقديم عرضنا للقيام بأعمال حصر الكميات وإعداد جداول الكميات والمواصفات (BOQ) للمشروع.',
    scopeOfWork: [
      { id: '1', title: 'حصر الكميات التفصيلي للمخططات', description: 'مراجعة المخططات المعمارية والإنشائية والكهروميكانيكية وحصر الكميات الفنية بدقة وفقاً للمقاييس المعتمدة.', notes: 'يتم استخدام برامج الحصر الهندسي لضمان الدقة.' },
      { id: '2', title: 'إعداد جدول الكميات (المسعر وغير المسعر)', description: 'صياغة بنود المواصفات التفصيلية وإعداد جداول BOQ الشاملة لكافة بنود المشروع مع وضع التقديرات السعرية الاسترشادية.', notes: 'يسلم الملف بصيغة Excel قابلة للتعديل.' }
    ],
    exclusions: ['حصر أي تعديلات تطرأ على المخططات بعد البدء بالحصر دون اتفاق مسبق', 'حصر المواد المخزنة أو التالفة في الموقع الفعلي'],
    paymentTerms: ['50% دفعة مقدمة لبدء أعمال الحصر والمراجعة', '50% دفعة نهائية عند تسليم ملف جداول الكميات النهائي بصيغة Excel'],
    termsConditions: {
      general: 'يتم الحصر بناءً على البيانات والمخططات الهندسية المزودة من العميل فقط.',
      clientResponsibilities: 'تزويد المكتب بنسخة نهائية ومعتمدة من المخططات (IFT).',
      consultantResponsibilities: 'ضمان دقة قياسات الحصر ومطابقتها للمعايير العالمية لحساب الكميات.',
      liabilityLimitations: 'الحد الأقصى للمسؤولية هو إعادة الحصر في حال وجود فروقات تتجاوز نسبة الخطأ المسموح بها (3%).',
      confidentiality: 'جداول تسعير وكميات المشروع تعد سرية ولا يتم مشاركتها مع أي أطراف خارجية.'
    }
  },
  'Project Management': {
    introduction: 'يسرنا تقديم عرضنا الفني والمالي لتقديم خدمات إدارة المشاريع المتكاملة لتنسيق وضبط جودة وتكلفة التنفيذ.',
    scopeOfWork: [
      { id: '1', title: 'إعداد الخطة الزمنية وإدارة التكاليف', description: 'إنشاء الجدول الزمني الرئيسي للمشروع (Primavera) ومراقبة التدفقات النقدية ومقارنة المنجز الفعلي بالمخطط.', notes: 'يتم تقديم تقارير دورية شهرية عن سير الأعمال.' },
      { id: '2', title: 'إدارة طرح المناقصات وتأهيل مقاولي البناء', description: 'إعداد وثائق طرح المناقصة وتلقي عروض الأسعار من المقاولين وتقييمها فنياً ومالياً وإعداد التوصيات للتعاقد.', notes: 'يضمن الحصول على أفضل الأسعار والجودة.' }
    ],
    exclusions: ['الإشراف الهندسي الميداني اليومي (عقد الإشراف منفصل)', 'سداد أي التزامات مالية نيابة عن العميل للمقاولين', 'إصدار التراخيص الحكومية مباشرة'],
    paymentTerms: ['20% دفعة مقدمة وتجهيز وإعداد خطة المشروع', 'دفعات شهرية متساوية توزع على مدة المشروع الفعلية كأتعاب إدارة ومتابعة'],
    termsConditions: {
      general: 'يقوم مدير المشروع بتمثيل العميل فنياً وإدارياً أمام المقاولين والجهات الخارجية.',
      clientResponsibilities: 'البت السريع واعتماد الميزانيات والقرارات لتجنب تأخر الجدول الزمني.',
      consultantResponsibilities: 'الالتزام برفع تقارير الانحراف والمخاطر واقتراح الحلول التصحيحية فوراً.',
      liabilityLimitations: 'المكتب غير مسؤول عن التقصير المباشر أو الإهمال من قبل مقاولي التنفيذ.',
      confidentiality: 'كافة وثائق المناقصات وأسعار المقاولين تحفظ بسرية تامة.'
    }
  }
};

// 9. Premium Project Details Page
export function ProjectDetailsPage(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [detailsJson, setDetailsJson] = useState<ProjectDetailsJson>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('Staff');
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);

  // Edit modal trigger
  const [editOpen, setEditOpen] = useState(false);

  // Quotation States
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'document'>('overview');
  const [quotation, setQuotation] = useState<any>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [targetWorkType, setTargetWorkType] = useState('SURVEY_TRANSFER');

  const isRtl = i18n.language === 'ar';

  const loadProjectData = async () => {
    if (!id) return;
    try {
      const projs = (await window.api.localDb.getProjects()) as ProjectItem[];
      const projItem = projs.find((p) => p.id === id);
      if (projItem) {
        setProject(projItem);
      }
      
      const details = (await window.api.localDb.getProjectDetails(id)) as { detailsJson?: ProjectDetailsJson } | null;
      if (details && details.detailsJson) {
        setDetailsJson(details.detailsJson);
        const meta = details.detailsJson.metadata || {};
        const inputPrice = parseFloat(meta.totalPrice || '0') || 0;
        
        let quo = details.detailsJson.quotation;
        if (quo) {
          quo = { ...quo };
          if (inputPrice > 0 && (!quo.items || quo.items.length === 0 || (quo.items.length === 1 && quo.items[0].total !== inputPrice))) {
            quo.items = [
              {
                id: quo.items?.[0]?.id || '1',
                itemNo: quo.items?.[0]?.itemNo || '1',
                description: projItem?.projectName || quo.items?.[0]?.description || (isRtl ? 'أعمال استشارية ومساحية' : 'Engineering & Surveying Works'),
                unit: quo.items?.[0]?.unit || (isRtl ? 'مقطوع' : 'LS'),
                quantity: quo.items?.[0]?.quantity || 1,
                unitPrice: inputPrice,
                total: inputPrice * (quo.items?.[0]?.quantity || 1)
              }
            ];
            quo.lumpSumPrice = inputPrice;
          }
          if (projItem?.projectName) {
            quo.subject = projItem.projectName;
          }
          if (projItem?.clientName) {
            quo.clientName = projItem.clientName;
            quo.toClientCompany = projItem.clientName;
          }
          if (meta.offerNumber || projItem?.projectNumber) {
            quo.refNumber = meta.offerNumber || projItem?.projectNumber;
          }
          setQuotation(quo);
        } else if (projItem && projItem.workType === 'PRICE_OFFERS') {
          // Initialize default quotation dynamically from project and metadata inputs
          const price = inputPrice > 0 ? inputPrice : 1500;
          const defaultQuo = {
            quotationDate: new Date().toISOString().split('T')[0],
            refNumber: meta.offerNumber || projItem.projectNumber || '',
            clientName: projItem.clientName || '',
            toClientCompany: projItem.clientName || '',
            attentionTo: '',
            subject: projItem.projectName || (isRtl ? 'عرض سعر فني ومالي' : 'Technical & Commercial Proposal'),
            introduction: isRtl 
              ? `يسرنا أن نقدم لكم عرضنا الفني والمالي الخاص بـ "${projItem.projectName || 'مشروعكم الموقر'}" بمدينة ${projItem.locationText || 'مكة المكرمة'}.`
              : `We are pleased to submit our quotation for providing engineering consultancy services for "${projItem.projectName || 'your esteemed project'}".`,
            scopeOfWork: isRtl 
              ? [
                  { 
                    id: '1', 
                    title: projItem.projectName || 'الأعمال والخدمات المساحية والاستشارية', 
                    description: projItem.notes || 'القيام بالرفع المساحي الميداني لقطع الأراضي، وتحديد المناسيب، والحدود، والربط بشبكة الإحداثيات الوطنية وإعداد المخططات.', 
                    notes: projItem.locationText ? `الموقع: ${projItem.locationText}` : 'يلتزم العميل بتقديم صك الملكية الكترونياً.' 
                  }
                ]
              : [
                  { 
                    id: '1', 
                    title: projItem.projectName || 'Topographic Surveying & Consultancy', 
                    description: projItem.notes || 'Perform complete topographic survey of the land parcel including boundary coordinates, elevations, and existing structures.', 
                    notes: projItem.locationText ? `Location: ${projItem.locationText}` : 'Boundary marks will be established.' 
                  }
                ],
            pricingType: 'itemized',
            lumpSumPrice: price,
            items: isRtl
              ? [
                  { 
                    id: '1', 
                    itemNo: '1', 
                    description: projItem.projectName || 'أعمال الرفع المساحي الميداني وتحديد الإحداثيات GPS', 
                    unit: 'مقطوع', 
                    quantity: 1, 
                    unitPrice: price, 
                    total: price 
                  }
                ]
              : [
                  { 
                    id: '1', 
                    itemNo: '1', 
                    description: projItem.projectName || 'Topographic Survey Works & GPS Coordinates', 
                    unit: 'LS', 
                    quantity: 1, 
                    unitPrice: price, 
                    total: price 
                  }
                ],
            currency: 'SAR',
            discount: 0,
            vatRate: 15,
            executionDuration: meta.executionDuration || (isRtl ? '30 يوم تقويمي' : '30 Calendar Days'),
            mobilizationPeriod: isRtl ? '7 أيام عمل' : '7 Calendar Days',
            deliveryTimeline: isRtl ? 'خلال المدة المتفق عليها من توقيع العقد' : 'Within agreed timeline',
            exclusions: isRtl
              ? [
                  'الرسوم الحكومية ورسوم استخراج التراخيص البلدية',
                  'أعمال فحص التربة والجسات الإنشائية',
                  'أعمال الحفر والردم وتجهيز الموقع الفعلي'
                ]
              : [
                  'Government fees & municipality permits',
                  'Third-party material testing',
                  'Boundary wall construction'
                ],
            paymentTerms: meta.paymentTerms ? [meta.paymentTerms] : (isRtl
              ? [
                  '50% دفعة مقدمة عند توقيع الاتفاقية ومباشرة العمل',
                  '50% دفعة نهائية عند تسليم الكروكيات والمخططات النهائية'
                ]
              : [
                  '50% Advance Payment upon signing of proposal',
                  '50% Final Payment upon submission of survey report'
                ]),
            validityDays: parseInt(meta.validityDays || '30', 10) || 30,
            termsConditions: isRtl
              ? {
                  general: 'يتم تنفيذ الخدمات الاستشارية وفقاً للأصول الفنية والهندسية المتعارف عليها وكود البناء السعودي.',
                  clientResponsibilities: 'يلتزم العميل بتسهيل الدخول للموقع وتوفير كافة مستندات ووثائق الملكية.',
                  consultantResponsibilities: 'يلتزم المكتب بتقديم التقارير الفنية والرسومات الهندسية الرقمية ضمن المدة المتفق عليها.',
                  liabilityLimitations: 'تقتصر المسؤولية القانونية للمكتب على حدود قيمة أتعاب هذا العقد فقط.',
                  confidentiality: 'يلتزم الطرفان بالمحافظة التامة على سرية مستندات المشروع وبيانات العميل.'
                }
              : {
                  general: 'The services will be conducted in accordance with professional engineering standards.',
                  clientResponsibilities: 'Client shall provide access to the site and all necessary ownership documents.',
                  consultantResponsibilities: 'Consultant shall deliver the digital CAD drawings and survey reports within the agreed timeline.',
                  liabilityLimitations: 'Consultant liability is limited to the contract value.',
                  confidentiality: 'Both parties agree to maintain strict confidentiality of all project documents.'
                },
            signatureSection: {
              preparedBy: isRtl ? 'إعداد: قسم المساحة' : 'Prepared By: Surveyor Dept.',
              reviewedBy: isRtl ? 'تدقيق: المدير الفني' : 'Reviewed By: Technical Director',
              approvedBy: isRtl ? 'اعتماد: المدير العام' : 'Approved By: General Manager',
              digitalSignature: true
            },
            branding: isRtl
              ? {
                  companyName: 'دار مكة للاستشارات الهندسية',
                  address: 'مكة المكرمة، المملكة العربية السعودية',
                  phone: '+966 12 555 1234',
                  email: 'info@darmakkah.com.sa',
                  website: 'www.darmakkah.com.sa',
                  crNumber: '4031087359',
                  vatNumber: '300012345600003'
                }
              : {
                  companyName: 'Dar Makkah Engineering Consultations',
                  address: 'Makkah Al Mukarramah, Saudi Arabia',
                  phone: '+966 12 555 1234',
                  email: 'info@darmakkah.com.sa',
                  website: 'www.darmakkah.com.sa',
                  crNumber: '4031087359',
                  vatNumber: '300012345600003'
                },
            templateType: 'Engineering Consultancy',
            versionHistory: [
              { version: 1, updatedAt: new Date().toISOString(), updatedBy: 'Admin', status: 'Draft', changes: 'Initial Draft Created' }
            ],
            currentStatus: 'Draft'
          };
          setQuotation(defaultQuo);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
    window.api.secureStorage.getItem('user').then((userStr) => {
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setUser(parsed);
          setUserRole(parsed.role || 'Staff');
        } catch {
          // ignore
        }
      }
    });
  }, [id]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProject = async () => {
    if (!project) return;
    if (userRole === 'Staff') {
      alert(isRtl ? 'خطأ: رتبة المساحين غير مخولة بحذف المشاريع' : 'Error: Staff roles are unauthorized to delete projects');
      setShowDeleteModal(false);
      return;
    }
    setIsDeleting(true);
    try {
      await window.api.localDb.upsertProject({ ...project, status: 'DELETED' }, true);
      setShowDeleteModal(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAttachment = async (item: AttachmentItem) => {
    try {
      await window.api.localDb.openAttachment(item.filePath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenOneDrive = (e: React.MouseEvent) => {
    if (window.api && window.api.localDb && window.api.localDb.openOneDriveFolder) {
      e.preventDefault();
      const name = project?.projectName || detailsJson?.projectName || '';
      window.api.localDb.openOneDriveFolder(name);
    }
  };

  // Timeline step toggle helper
  const handleStepToggle = async (stepKey: string, targetPercentage: number, isChecking: boolean) => {
    if (!project) return;
    try {
      const stepName = t(`steps.${project.workType}.${stepKey}`);
      const actionText = isChecking
        ? `Marked step "${stepName}" as complete`
        : `Marked step "${stepName}" as incomplete`;
      
      const newProgress = targetPercentage;
      let newStatus = project.status;
      
      // Auto-suggest status per Section 6
      if (newProgress === 0) newStatus = 'PENDING';
      else if (newProgress < 50) newStatus = 'UNDER_PROCEDURE';
      else if (newProgress < 100) newStatus = 'IN_PROGRESS';
      else newStatus = 'COMPLETED';

      const logEntry = {
        timestamp: new Date().toISOString(),
        user: user?.fullName || 'Surveyor',
        action: actionText,
        oldProgress: project.progress,
        newProgress
      };

      const updatedProject = {
        ...project,
        progress: newProgress,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      const updatedDetails = {
        ...detailsJson,
        auditLogs: [...(detailsJson.auditLogs || []), logEntry]
      };

      await window.api.localDb.upsertProject(updatedProject, true);
      await window.api.localDb.upsertProjectDetails({
        id: crypto.randomUUID(),
        projectId: project.id,
        workType: project.workType,
        detailsJson: updatedDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, true);

      setProject(updatedProject);
      setDetailsJson(updatedDetails);
      loadProjectData();
    } catch (err) {
      console.error(err);
    }
  };

  // Status manual override helper
  const handleStatusOverride = async (newStatus: string) => {
    if (!project) return;
    try {
      const actionText = `Manually overrode status to "${t(`status.${newStatus.charAt(0).toLowerCase() + newStatus.slice(1)}`)}"`;
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        user: user?.fullName || 'Surveyor',
        action: actionText,
        oldStatus: project.status,
        newStatus
      };

      const updatedProject = {
        ...project,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      const updatedDetails = {
        ...detailsJson,
        auditLogs: [...(detailsJson.auditLogs || []), logEntry]
      };

      await window.api.localDb.upsertProject(updatedProject, true);
      await window.api.localDb.upsertProjectDetails({
        id: crypto.randomUUID(),
        projectId: project.id,
        workType: project.workType,
        detailsJson: updatedDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, true);

      setProject(updatedProject);
      setDetailsJson(updatedDetails);
      loadProjectData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveQuotation = async (updatedQuo: any) => {
    try {
      const newVersion = (updatedQuo.versionHistory?.length || 0) + 1;
      const historyEntry = {
        version: newVersion,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.fullName || 'Surveyor',
        status: updatedQuo.currentStatus || 'Draft',
        changes: `Quotation updated to version ${newVersion}`
      };
      
      const finalizedQuo = {
        ...updatedQuo,
        versionHistory: [...(updatedQuo.versionHistory || []), historyEntry]
      };
      
      const updatedDetails = {
        ...detailsJson,
        quotation: finalizedQuo
      };

      await window.api.localDb.upsertProjectDetails({
        id: crypto.randomUUID(),
        projectId: project!.id,
        workType: project!.workType,
        detailsJson: updatedDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, true);

      setDetailsJson(updatedDetails);
      setQuotation(finalizedQuo);
      alert(isRtl ? 'تم حفظ العرض المالي وتحديث النسخة بنجاح!' : 'Quotation saved and version history updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving quotation / خطأ في حفظ العرض المالي');
    }
  };

  const handleAIAssist = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      if (!quotation) return;
      
      const subj = quotation.subject || (isRtl ? 'أعمال استشارية هندسية' : 'Engineering consultancy works');
      const loc = project?.locationText || (isRtl ? 'مكة المكرمة' : 'Makkah');
      const client = project?.clientName || (isRtl ? 'العميل الكريم' : 'Valued Client');
      
      const generatedIntro = isRtl
        ? `يسرنا أن نقدم لشركة/مؤسسة ${client} عرضنا الفني والمالي المتكامل للقيام بـ "${subj}" في موقعكم الموقر بمدينة ${loc}. يلتزم فريقنا الاستشاري بتقديم أعلى مستويات الجودة الفنية والمساحية وتصميم المخططات بالتوافق مع كود البناء السعودي ومعايير البلدية.`
        : `We are pleased to submit our professional engineering consultancy proposal to ${client} for the project "${subj}" located in ${loc}. Our team is dedicated to delivering the highest quality surveying, design, and technical studies in compliance with Saudi Building Codes and municipality regulations.`;
      
      const generatedScope = isRtl
        ? [
            { id: 'ai-1', title: 'المرحلة الأولى: الرفع المساحي والتحقق من التضاريس والتربة', description: 'القيام بالرفع المساحي الكامل لقطع الأراضي، وتحديد المعالم القائمة، والتحقق من مناسيب التربة والتضاريس.', notes: 'يلتزم العميل بتوفير مستندات الملكية والوصول الآمن للموقع.' },
            { id: 'ai-2', title: 'المرحلة الثانية: إعداد المخططات الهندسية والتصميم الإنشائي والمعماري', description: 'إعداد الرسومات التنفيذية المعمارية والإنشائية التفصيلية ومخططات التأسيس الكهربائي والصحي المعتمدة.', notes: 'تصمم الحسابات الإنشائية وفق أحدث معايير كود البناء السعودي.' },
            { id: 'ai-3', title: 'المرحلة الثالثة: تقديم المعاملة لبلدية مكة والمنصات الرسمية', description: 'التنسيق التام لرفع التقارير الهندسية والمخططات عبر منصة بلدي ومتابعتها حتى صدور الرخصة والاعتمادات.', notes: 'يتم الرفع الكترونياً بواسطة مهندسينا المعتمدين.' }
          ]
        : [
            { id: 'ai-1', title: 'Phase 1: Initial Investigation & Geotechnical Review', description: 'Analyze the property topography, coordinate system layout, and verify soil/geotechnical details.', notes: 'All documents must be approved by Makkah Municipality.' },
            { id: 'ai-2', title: 'Phase 2: Comprehensive Engineering Drafting & Structural Design', description: 'Complete architectural layout plans, structural drawings, and MEP details ready for permit submission.', notes: 'Calculations will be performed in accordance with SBC 301.' },
            { id: 'ai-3', title: 'Phase 3: Final Submission & Permit Coordination', description: 'Coordinate with Baladi portal inspectors and supply municipal reports for direct building license release.', notes: 'Consultant will upload reports directly to Baladi.' }
          ];

      const generatedExclusions = isRtl
        ? [
            'الرسوم الحكومية، والبلدية، وتكاليف منصة بلدي',
            'القيام بأعمال الحفر، أو البناء، أو التشطيب المادي بالموقع',
            'حل أي نزاعات قانونية أو حدودية مع الجيران أو الجهات الرسمية',
            'تكاليف الفحوصات المخبرية الإضافية للمواد'
          ]
        : [
            'Municipal license application fees & government tariffs',
            'Direct site execution or construction contracting works',
            'Handling disputes with adjacent neighbors regarding land boundaries',
            'Third-party laboratory test reports'
          ];

      const generatedPaymentTerms = isRtl
        ? [
            '30% دفعة مقدمة لبدء التعبئة وتجهيز المهندسين',
            '50% دفعة ثانية بعد تقديم ومراجعة المخططات الأولية للمشروع',
            '20% دفعة نهائية عند تسليم الاعتماد النهائي أو رخصة البناء'
          ]
        : [
            '30% Advance Mobilization payment upon contract award',
            '50% Intermediate Payment upon completion and review of detailed designs',
            '20% Final Payment upon issuance of the building permit/report'
          ];

      setQuotation({
        ...quotation,
        introduction: generatedIntro,
        scopeOfWork: generatedScope,
        exclusions: generatedExclusions,
        paymentTerms: generatedPaymentTerms
      });
      alert(isRtl ? 'تم توليد العرض الفني والمالي بالذكاء الاصطناعي بنجاح!' : 'AI has successfully generated professional engineering proposal details!');
    }, 1200);
  };

  const handleExportWord = () => {
    if (!quotation) return;
    
    const meta = detailsJson?.metadata || {};
    const inputPrice = parseFloat(meta.totalPrice || '0') || 0;
    let effectiveItems = quotation.items || [];
    if (inputPrice > 0 && (!effectiveItems.length || (effectiveItems.length === 1 && effectiveItems[0].total !== inputPrice))) {
      effectiveItems = [
        {
          id: effectiveItems[0]?.id || '1',
          itemNo: effectiveItems[0]?.itemNo || '1',
          description: project?.projectName || quotation.subject || effectiveItems[0]?.description || (isRtl ? 'أعمال استشارية ومساحية' : 'Engineering & Surveying Works'),
          unit: effectiveItems[0]?.unit || (isRtl ? 'مقطوع' : 'LS'),
          quantity: effectiveItems[0]?.quantity || 1,
          unitPrice: inputPrice,
          total: inputPrice * (effectiveItems[0]?.quantity || 1)
        }
      ];
    }
    let subtotal = 0;
    if (quotation.pricingType === 'lump_sum') {
      subtotal = inputPrice > 0 ? inputPrice : (quotation.lumpSumPrice || 0);
    } else {
      subtotal = effectiveItems.reduce((sum: number, item: any) => sum + item.total, 0);
      if (subtotal === 0 && inputPrice > 0) subtotal = inputPrice;
    }
    const vatAmount = (subtotal * (quotation.vatRate || 15)) / 100;
    const discount = quotation.discount || 0;
    const grandTotal = subtotal + vatAmount - discount;
    
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Quotation ${quotation.refNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 1in; direction: ${isRtl ? 'rtl' : 'ltr'}; text-align: ${isRtl ? 'right' : 'left'}; }
          h1, h2, h3 { color: #1B365D; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: ${isRtl ? 'right' : 'left'}; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 30px; }
          .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${DMC_LOGO_BASE64}" width="180" alt="DMC Logo" style="margin-bottom: 8px; display: inline-block;" />
          <h2>${quotation.branding?.companyName || 'Dar Makkah Engineering Consultations'}</h2>
          <p>${quotation.branding?.address || ''} | Tel: ${quotation.branding?.phone || ''}</p>
        </div>
        <hr/>
        <h3>QUOTATION & PROPOSAL</h3>
        <p><b>Date:</b> ${quotation.quotationDate}</p>
        <p><b>Ref:</b> ${quotation.refNumber}</p>
        <p><b>Client:</b> ${quotation.clientName}</p>
        <p><b>Subject:</b> ${quotation.subject}</p>
        <hr/>
        <p>${quotation.introduction}</p>
        
        <h4>SCOPE OF WORK</h4>
        <ol>
          ${quotation.scopeOfWork?.map((item: any) => `
            <li>
              <b>${item.title}</b><br/>
              ${item.description}
              ${item.notes ? `<br/><i>Notes: ${item.notes}</i>` : ''}
            </li>
          `).join('') || ''}
        </ol>
        
        <h4>COMMERCIAL PROPOSAL</h4>
        ${quotation.pricingType === 'lump_sum' 
          ? `<p>Lump Sum Price: <b>${subtotal} ${quotation.currency}</b></p>`
          : `
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${effectiveItems.map((item: any) => `
                  <tr>
                    <td>${item.itemNo}</td>
                    <td>${item.description}</td>
                    <td>${item.unit}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice}</td>
                    <td>${item.total}</td>
                  </tr>
                `).join('') || ''}
                <tr>
                  <td colspan="5" style="text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="font-weight: bold;">${subtotal} ${quotation.currency}</td>
                </tr>
                <tr>
                  <td colspan="5" style="text-align: right; font-weight: bold;">VAT (${quotation.vatRate || 15}%):</td>
                  <td style="font-weight: bold;">${vatAmount.toFixed(2)} ${quotation.currency}</td>
                </tr>
                <tr>
                  <td colspan="5" style="text-align: right; font-weight: bold;">Grand Total:</td>
                  <td style="font-weight: bold; color: #1B365D;">${grandTotal.toFixed(2)} ${quotation.currency}</td>
                </tr>
              </tbody>
            </table>
          `
        }
        
        <h4>PAYMENT TERMS</h4>
        <ul>
          ${quotation.paymentTerms?.map((term: any) => `<li>${term}</li>`).join('') || ''}
        </ul>
        
        <h4>EXCLUSIONS</h4>
        <ul>
          ${quotation.exclusions?.map((ex: any) => `<li>${ex}</li>`).join('') || ''}
        </ul>
        
        <div style="margin-top: 30px;">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="border: none; text-align: center; width: 33%; vertical-align: top;">
                <b>${isRtl ? 'إعداد' : 'Prepared By'}</b><br/><br/>
                ${quotation.signatureSection?.preparedBy || ''}
              </td>
              <td style="border: none; text-align: center; width: 33%; vertical-align: top;">
                <b>${isRtl ? 'تدقيق' : 'Reviewed By'}</b><br/><br/>
                ${quotation.signatureSection?.reviewedBy || ''}
              </td>
              <td style="border: none; text-align: center; width: 33%; vertical-align: top;">
                <b>${isRtl ? 'اعتماد وختم الشركة' : 'Approved & Sealed'}</b><br/><br/>
                ${quotation.signatureSection?.approvedBy || ''}<br/>
                <img src="${DMC_STAMP_BASE64}" width="120" height="120" style="margin-top: 8px;" alt="DMC Stamp" />
              </td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Generated by SDMS - Dar Makkah Engineering Consultations</p>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quotation_${quotation.refNumber || 'Draft'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!quotation || !quotation.items) return;
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Item No,Description,Unit,Quantity,Unit Price,Total\n';
    
    quotation.items.forEach((item: any) => {
      csvContent += `"${item.itemNo}","${item.description}","${item.unit}",${item.quantity},${item.unitPrice},${item.total}\n`;
    });
    
    const subtotal = quotation.items.reduce((sum: number, item: any) => sum + item.total, 0);
    const vatAmount = (subtotal * (quotation.vatRate || 15)) / 100;
    const discount = quotation.discount || 0;
    const grandTotal = subtotal + vatAmount - discount;
    
    csvContent += `\n,,,,Subtotal,${subtotal}\n`;
    csvContent += `,,,,VAT (${quotation.vatRate || 15}%),${vatAmount}\n`;
    if (discount > 0) csvContent += `,,,,Discount,${discount}\n`;
    csvContent += `,,,,Grand Total (${quotation.currency}),${grandTotal}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BOQ_${quotation.refNumber || 'Draft'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConvertProject = async () => {
    if (!project) return;
    try {
      const updatedProject = {
        ...project,
        workType: targetWorkType,
        progress: 0,
        status: 'PENDING',
        updatedAt: new Date().toISOString()
      };

      const logEntry = {
        timestamp: new Date().toISOString(),
        user: user?.fullName || 'Manager',
        action: `Converted Quotation (${project.projectNumber}) into active project of type ${targetWorkType}`
      };

      const updatedDetails = {
        ...detailsJson,
        auditLogs: [...(detailsJson.auditLogs || []), logEntry]
      };

      await window.api.localDb.upsertProject(updatedProject, true);
      await window.api.localDb.upsertProjectDetails({
        id: crypto.randomUUID(),
        projectId: project.id,
        workType: targetWorkType,
        detailsJson: updatedDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, true);

      alert(isRtl ? 'تم تحويل العرض المالي بنجاح إلى مشروع نشط!' : 'Quotation converted successfully to active project!');
      setShowConvertModal(false);
      navigate(`/project/${project.id}`);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <PlaceholderWrapper title="Project Details" icon={FileText}>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
        </div>
      </PlaceholderWrapper>
    );
  }

  if (!project) {
    return (
      <PlaceholderWrapper title="Project Not Found" icon={FileText}>
        <div className="text-center py-12 space-y-3">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h4 className="font-bold text-md text-foreground">Project Not Found / المشروع غير موجود</h4>
          <Link to="/dashboard" className="text-primary hover:underline text-sm font-semibold">
            {isRtl ? 'العودة للوحة التحكم' : 'Return to Dashboard'}
          </Link>
        </div>
      </PlaceholderWrapper>
    );
  }

  const steps = WORKFLOW_STEPS[project.workType] || [];
  const currentStep = getActiveStep(project.workType, project.progress);
  
  const attachments = detailsJson.attachments || [];
  const metadata = detailsJson.metadata || {};
  const auditLogs = detailsJson.auditLogs || [];

  const renderOverview = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Blocks */}
        <div className="lg:col-span-2 space-y-6 print:col-span-3">
          
          {/* Project Banner Header Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                {project.workType}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{project.projectNumber}</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-foreground">{project.projectName}</h3>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground mt-1.5">
                  <span>
                    {t('common.dateAdded')}: {new Date(project.createdAt).toLocaleString(i18n.language)}
                  </span>
                  {(project.createdBy || detailsJson.createdBy) && (
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      <span>{isRtl ? 'أنشئ بواسطة' : 'Created by'}:</span>
                      <span className="font-semibold text-foreground">{project.createdBy || detailsJson.createdBy}</span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Manual Status Override Selector Dropdown */}
              <div className="flex flex-col items-end print:hidden">
                <label className="text-[10px] font-bold text-muted-foreground mb-1">
                  {isRtl ? 'تعديل الحالة يدوياً' : 'Override Status'}
                </label>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusOverride(e.target.value)}
                  className="px-2 py-1 text-xs border border-border rounded-lg bg-background font-semibold focus:outline-none"
                >
                  <option value="PENDING">{t('status.pending')}</option>
                  <option value="UNDER_PROCEDURE">{t('status.underProcedure')}</option>
                  <option value="IN_PROGRESS">{t('status.inProgress')}</option>
                  <option value="COMPLETED">{t('status.completed')}</option>
                </select>
              </div>
            </div>

            {/* Progress Color bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{currentStep ? t(`steps.${project.workType}.${currentStep.key}`) : t('status.pending')}</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Client Info Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              {t('common.client')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-muted-foreground">{t('common.clientName')}</span>
                <span className="font-bold text-foreground">{project.clientName}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">{t('common.clientPhone')}</span>
                <span className="font-semibold text-foreground font-mono">{project.clientPhone}</span>
              </div>
            </div>
          </div>

          {/* Financial Payment Tracking Card */}
          {(metadata.contractValue || metadata.grandTotal || metadata.paidAmount || metadata.remainingAmount) && (() => {
            const totVal = parseFloat(metadata.contractValue || metadata.grandTotal || metadata.totalPrice || '0') || 0;
            const paidVal = parseFloat(metadata.paidAmount || '0') || 0;
            const remVal = parseFloat(metadata.remainingAmount || String(Math.max(0, totVal - paidVal))) || 0;
            const pctPaid = metadata.paymentPercentage || (totVal > 0 ? ((paidVal / totVal) * 100).toFixed(1) : '0');

            return (
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span>💰</span>
                    <span>{isRtl ? 'المتابعة المالية والدفعات' : 'Financial Payment Tracking'}</span>
                  </h4>
                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2.5 py-0.5 rounded-full font-mono">
                    {pctPaid}% {isRtl ? 'مسدد' : 'Paid'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/20 p-3 rounded-xl border border-border/50">
                    <span className="block text-[11px] text-muted-foreground font-semibold mb-1">
                      {isRtl ? 'قيمة المعاملة / العمل' : 'Total Work Amount'}
                    </span>
                    <span className="font-extrabold text-foreground font-mono text-base">
                      {totVal > 0 ? `${totVal.toLocaleString(i18n.language)} ر.س` : '—'}
                    </span>
                  </div>

                  <div className="bg-green-500/5 p-3 rounded-xl border border-green-500/20">
                    <span className="block text-[11px] text-green-700 dark:text-green-400 font-semibold mb-1">
                      {isRtl ? 'المبلغ المدفوع (المحصل)' : 'Paid Amount'}
                    </span>
                    <span className="font-extrabold text-green-600 dark:text-green-400 font-mono text-base">
                      {paidVal.toLocaleString(i18n.language)} ر.س
                    </span>
                  </div>

                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                    <span className="block text-[11px] text-amber-700 dark:text-amber-400 font-semibold mb-1">
                      {isRtl ? 'المبلغ المتبقي' : 'Remaining Balance'}
                    </span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono text-base">
                      {remVal > 0 ? `${remVal.toLocaleString(i18n.language)} ر.س` : (isRtl ? 'مسدد بالكامل' : 'Paid in Full')}
                    </span>
                  </div>
                </div>

                {metadata.paymentTerms && (
                  <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                    <span className="font-bold text-foreground block mb-1">{isRtl ? 'شروط وتوزيع الدفعات:' : 'Payment Terms:'}</span>
                    <p className="whitespace-pre-line">{metadata.paymentTerms}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Work-Type Specific Metadata Card */}
          {Object.keys(metadata).length > 0 && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                {isRtl ? 'البيانات الفنية المساحية' : 'Technical Surveying Metadata'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(metadata).map(([key, val]) => (
                  <div key={key}>
                    <span className="block text-xs text-muted-foreground">{t(`fields.${key}`)}</span>
                    <span className="font-bold text-foreground">
                      {key === 'requestingAuthority' || key === 'reportType' || key === 'landUse'
                        ? t(`${key}s.${val}`)
                        : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Coordinates Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              📍 {isRtl ? 'الموقع الجغرافي والإحداثيات' : 'Geographic Location & Coordinates'}
            </h4>
            <div className="space-y-4">
              {project.locationText && (
                <div>
                  <span className="block text-xs text-muted-foreground">{t('common.locationText')}</span>
                  <span className="font-semibold text-foreground">{project.locationText}</span>
                </div>
              )}
              
              {project.locationLat && project.locationLng && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-muted-foreground">{t('common.latitude')}</span>
                    <span className="font-mono text-foreground">{project.locationLat}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground">{t('common.longitude')}</span>
                    <span className="font-mono text-foreground">{project.locationLng}</span>
                  </div>
                  <div className="md:col-span-2 pt-2 print:hidden">
                    <a
                      href={`https://www.google.com/maps?q=${project.locationLat},${project.locationLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-primary font-bold text-xs rounded-lg border border-border hover:bg-accent transition-all shadow-sm"
                    >
                      🗺️ {isRtl ? 'عرض على خرائط جوجل' : 'Open in Google Maps'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-2">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                {t('common.notes')}
              </h4>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{project.notes}</p>
            </div>
          )}

          {/* Attachments Section */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                📎 {t('common.attachments')} ({attachments.length})
              </h4>
              <a
                href="https://1drv.ms/f/c/0a257d75be9315f7/IgClaRD1xDsZQrZQWBjQrqSxAcg5Cj0LnhDtzkCJ11pabj0?e=RmZiBI"
                target="_blank"
                rel="noreferrer"
                onClick={handleOpenOneDrive}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                🌐 {isRtl ? 'فتح في ون درايف' : 'Open in OneDrive'}
              </a>
            </div>
            
            {attachments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No attachment files uploaded.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/20 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenAttachment(file)}
                      className="flex items-center gap-2 text-primary hover:underline font-bold truncate flex-1 text-start"
                    >
                      <FileUp className="h-4 w-4 shrink-0" />
                      <span className="truncate">{file.fileName}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAttachment(file)}
                      className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded shadow-sm print:hidden ml-2 mr-2"
                      title="Download/Open"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Log Timeline */}
          {auditLogs.length > 0 && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                <span>{isRtl ? 'سجل العمليات والتدقيق' : 'Audit Logs & History'}</span>
              </h4>
              
              <div className="space-y-4 relative py-2">
                {auditLogs.map((log: AuditLogItem, idx: number) => (
                  <div key={idx} className="flex gap-3 text-xs border-s border-border ps-4 relative">
                    <div className="absolute -start-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{log.user}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString(i18n.language)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{log.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Workflow Interactive Timeline Sidebar */}
        <div className="space-y-6 print:hidden">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 sticky top-6">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-primary" />
              <span>{isRtl ? 'خطوات سير العمل' : 'Workflow Timeline'}</span>
            </h4>

            <div className="relative ps-6 border-s border-border space-y-6 py-2">
              {steps.map((step, idx) => {
                const isCompleted = project.progress >= step.percentage;
                const isActive = currentStep?.key === step.key;
                const stepName = t(`steps.${project.workType}.${step.key}`);

                // Inline Sequential Checklist Progression toggling
                const canCheck = idx === 0 ? true : project.progress >= steps[idx - 1].percentage;
                const canUncheck = idx === steps.length - 1 ? true : project.progress < steps[idx + 1].percentage;
                const isDisabled = isCompleted ? !canUncheck : !canCheck;

                return (
                  <div key={step.key} className="relative flex items-start gap-3">
                    {/* Step Circle Indicator (interactive toggle) */}
                    <button
                      onClick={() => handleStepToggle(step.key, step.percentage, !isCompleted)}
                      disabled={isDisabled}
                      className={`absolute -start-[33px] top-0.5 h-6 w-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all ${
                        isCompleted 
                          ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                          : isActive 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/95 ring-2 ring-primary/20' 
                            : 'bg-card text-muted-foreground border-border hover:bg-accent'
                      } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      title={
                        isDisabled 
                          ? 'Bypassing intermediate steps is disabled' 
                          : isCompleted 
                            ? 'Mark step incomplete' 
                            : 'Mark step complete'
                      }
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </button>

                    {/* Step Description */}
                    <div className="ps-2">
                      <div className={`font-bold text-xs ${
                        isCompleted ? 'text-green-600 dark:text-green-400' : isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {stepName}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {step.percentage}% {isCompleted ? (isRtl ? '(مكتمل)' : '(Completed)') : isActive ? (isRtl ? '(الحالي)' : '(Active)') : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderBuilder = () => {
    if (!quotation) return null;
    return (
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{isRtl ? 'منشئ العروض الفنية والمالية' : 'Quotation & Proposal Builder'}</h3>
            <p className="text-xs text-muted-foreground">{isRtl ? 'صمم وراجع بنود العرض والأسعار والتفاصيل الفنية' : 'Customize proposal scope, pricing, terms, and templates.'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAIAssist}
              disabled={aiGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
            >
              ✨ {aiGenerating ? (isRtl ? 'جاري التوليد...' : 'Generating...') : (isRtl ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI')}
            </button>
            <button
              onClick={() => handleSaveQuotation(quotation)}
              className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg transition-all shadow-sm"
            >
              💾 {isRtl ? 'حفظ التعديلات' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Form Fields (Col 1 & 2) */}
          <div className="xl:col-span-2 space-y-6">
            {/* General Details */}
            <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'المعلومات العامة' : 'General Info'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'رقم المرجع' : 'Reference Number'}</label>
                  <input
                    type="text"
                    value={quotation.refNumber || ''}
                    onChange={(e) => setQuotation({ ...quotation, refNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'تاريخ العرض' : 'Quotation Date'}</label>
                  <input
                    type="date"
                    value={quotation.quotationDate || ''}
                    onChange={(e) => setQuotation({ ...quotation, quotationDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'اسم العميل' : 'Client Name'}</label>
                  <input
                    type="text"
                    value={quotation.clientName || ''}
                    onChange={(e) => setQuotation({ ...quotation, clientName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'إلى (اسم الشركة / العميل)' : 'To (Company / Client)'}</label>
                  <input
                    type="text"
                    value={quotation.toClientCompany || ''}
                    onChange={(e) => setQuotation({ ...quotation, toClientCompany: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'عناية (اختياري)' : 'Attention To (Optional)'}</label>
                  <input
                    type="text"
                    value={quotation.attentionTo || ''}
                    onChange={(e) => setQuotation({ ...quotation, attentionTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'الموضوع' : 'Subject'}</label>
                  <input
                    type="text"
                    value={quotation.subject || ''}
                    onChange={(e) => setQuotation({ ...quotation, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Introduction Template */}
            <div className="p-4 border border-border rounded-xl space-y-3 bg-muted/10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'المقدمة' : 'Introduction'}</h4>
              <textarea
                value={quotation.introduction || ''}
                onChange={(e) => setQuotation({ ...quotation, introduction: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background font-sans"
              />
            </div>

            {/* Scope of Work */}
            <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'نطاق العمل' : 'Scope of Work'}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newScope = [...(quotation.scopeOfWork || []), { id: Date.now().toString(), title: isRtl ? 'بند جديد' : 'New Scope Item', description: '', notes: '' }];
                    setQuotation({ ...quotation, scopeOfWork: newScope });
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  ➕ {isRtl ? 'إضافة بند جديد' : 'Add Scope Item'}
                </button>
              </div>
              <div className="space-y-4">
                {(quotation.scopeOfWork || []).map((scope: any, idx: number) => (
                  <div key={scope.id} className="p-3 border border-border bg-card rounded-xl space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-muted-foreground">{isRtl ? `بند رقم ${idx + 1}` : `Scope Item #${idx + 1}`}</span>
                      <div className="flex items-center gap-1.5 print:hidden">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const list = [...quotation.scopeOfWork];
                            const temp = list[idx];
                            list[idx] = list[idx - 1];
                            list[idx - 1] = temp;
                            setQuotation({ ...quotation, scopeOfWork: list });
                          }}
                          className="p-1 hover:bg-accent rounded disabled:opacity-30 text-xs"
                          title="Move Up"
                        >
                          ⬆️
                        </button>
                        <button
                          type="button"
                          disabled={idx === quotation.scopeOfWork.length - 1}
                          onClick={() => {
                            const list = [...quotation.scopeOfWork];
                            const temp = list[idx];
                            list[idx] = list[idx + 1];
                            list[idx + 1] = temp;
                            setQuotation({ ...quotation, scopeOfWork: list });
                          }}
                          className="p-1 hover:bg-accent rounded disabled:opacity-30 text-xs"
                          title="Move Down"
                        >
                          ⬇️
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = quotation.scopeOfWork.filter((s: any) => s.id !== scope.id);
                            setQuotation({ ...quotation, scopeOfWork: filtered });
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-950 text-red-500 rounded text-xs"
                          title="Delete"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Scope Title / عنوان البند"
                        value={scope.title}
                        onChange={(e) => {
                          const list = [...quotation.scopeOfWork];
                          list[idx].title = e.target.value;
                          setQuotation({ ...quotation, scopeOfWork: list });
                        }}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-border rounded-lg bg-background"
                      />
                      <textarea
                        placeholder="Description / وصف البند"
                        value={scope.description}
                        onChange={(e) => {
                          const list = [...quotation.scopeOfWork];
                          list[idx].description = e.target.value;
                          setQuotation({ ...quotation, scopeOfWork: list });
                        }}
                        rows={2}
                        className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                      />
                      <input
                        type="text"
                        placeholder="Notes (Optional) / ملاحظات إضافية"
                        value={scope.notes || ''}
                        onChange={(e) => {
                          const list = [...quotation.scopeOfWork];
                          list[idx].notes = e.target.value;
                          setQuotation({ ...quotation, scopeOfWork: list });
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background italic"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commercial Proposal */}
            <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'العرض المالي والتسعير' : 'Commercial Proposal'}</h4>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingType"
                      checked={quotation.pricingType === 'lump_sum'}
                      onChange={() => setQuotation({ ...quotation, pricingType: 'lump_sum' })}
                    />
                    <span>{isRtl ? 'مبلغ إجمالي' : 'Lump Sum'}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingType"
                      checked={quotation.pricingType === 'itemized'}
                      onChange={() => setQuotation({ ...quotation, pricingType: 'itemized' })}
                    />
                    <span>{isRtl ? 'جدول بنود مفصل' : 'Itemized Table'}</span>
                  </label>
                </div>
              </div>

              {quotation.pricingType === 'lump_sum' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'المبلغ الإجمالي الخاضع للضريبة' : 'Lump Sum Price'}</label>
                    <input
                      type="number"
                      value={quotation.lumpSumPrice || 0}
                      onChange={(e) => setQuotation({ ...quotation, lumpSumPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'العملة' : 'Currency'}</label>
                    <select
                      value={quotation.currency || 'SAR'}
                      onChange={(e) => setQuotation({ ...quotation, currency: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                    >
                      <option value="SAR">SAR (ر.س)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="Custom">{isRtl ? 'عملة مخصصة' : 'Custom Currency'}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted text-muted-foreground border-b border-border">
                          <th className="p-2 text-start w-12">{isRtl ? 'بند' : 'Item'}</th>
                          <th className="p-2 text-start">{isRtl ? 'الوصف' : 'Description'}</th>
                          <th className="p-2 text-start w-16">{isRtl ? 'الوحدة' : 'Unit'}</th>
                          <th className="p-2 text-start w-16">{isRtl ? 'الكمية' : 'Qty'}</th>
                          <th className="p-2 text-start w-24">{isRtl ? 'سعر الوحدة' : 'Unit Price'}</th>
                          <th className="p-2 text-start w-24">{isRtl ? 'الإجمالي' : 'Total'}</th>
                          <th className="p-2 text-center w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(quotation.items || []).map((item: any, idx: number) => (
                          <tr key={item.id} className="border-b border-border hover:bg-muted/10">
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.itemNo}
                                onChange={(e) => {
                                  const items = [...quotation.items];
                                  items[idx].itemNo = e.target.value;
                                  setQuotation({ ...quotation, items });
                                }}
                                className="w-full px-1.5 py-1 text-[11px] border border-border rounded bg-background"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => {
                                  const items = [...quotation.items];
                                  items[idx].description = e.target.value;
                                  setQuotation({ ...quotation, items });
                                }}
                                className="w-full px-1.5 py-1 text-[11px] border border-border rounded bg-background"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => {
                                  const items = [...quotation.items];
                                  items[idx].unit = e.target.value;
                                  setQuotation({ ...quotation, items });
                                }}
                                className="w-full px-1.5 py-1 text-[11px] border border-border rounded bg-background"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const items = [...quotation.items];
                                  items[idx].quantity = parseFloat(e.target.value) || 0;
                                  items[idx].total = items[idx].quantity * items[idx].unitPrice;
                                  setQuotation({ ...quotation, items });
                                }}
                                className="w-full px-1.5 py-1 text-[11px] border border-border rounded bg-background"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const items = [...quotation.items];
                                  items[idx].unitPrice = parseFloat(e.target.value) || 0;
                                  items[idx].total = items[idx].quantity * items[idx].unitPrice;
                                  setQuotation({ ...quotation, items });
                                }}
                                className="w-full px-1.5 py-1 text-[11px] border border-border rounded bg-background"
                              />
                            </td>
                            <td className="p-2 font-mono font-bold text-foreground">
                              {item.total}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = quotation.items.filter((i: any) => i.id !== item.id);
                                  setQuotation({ ...quotation, items: filtered });
                                }}
                                className="text-red-500 hover:text-red-600 font-bold"
                              >
                                ❌
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...(quotation.items || []), { id: Date.now().toString(), itemNo: ((quotation.items?.length || 0) + 1).toString(), description: isRtl ? 'خدمة هندسية استشارية' : 'Consultancy Service', unit: isRtl ? 'مقطوع' : 'LS', quantity: 1, unitPrice: 1000, total: 1000 }];
                      setQuotation({ ...quotation, items: newItems });
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    ➕ {isRtl ? 'إضافة بند تسعير جديد' : 'Add Pricing Item'}
                  </button>
                </div>
              )}

              {/* VAT, Discount, and Currency selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'العملة' : 'Currency'}</label>
                  <select
                    value={quotation.currency || 'SAR'}
                    onChange={(e) => setQuotation({ ...quotation, currency: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  >
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="Custom">{isRtl ? 'عملة مخصصة' : 'Custom'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'نسبة ضريبة القيمة المضافة (%)' : 'VAT Rate (%)'}</label>
                  <input
                    type="number"
                    value={quotation.vatRate || 0}
                    onChange={(e) => setQuotation({ ...quotation, vatRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'قيمة الخصم (اختياري)' : 'Discount Amount (Optional)'}</label>
                  <input
                    type="number"
                    value={quotation.discount || 0}
                    onChange={(e) => setQuotation({ ...quotation, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Project Duration & Timeline */}
            <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'مدة المشروع والتسليم' : 'Project Duration & Timeline'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'مدة التنفيذ' : 'Execution Duration'}</label>
                  <input
                    type="text"
                    value={quotation.executionDuration || ''}
                    onChange={(e) => setQuotation({ ...quotation, executionDuration: e.target.value })}
                    placeholder="e.g. 30 Calendar Days"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'فترة التجهيز' : 'Mobilization Period'}</label>
                  <input
                    type="text"
                    value={quotation.mobilizationPeriod || ''}
                    onChange={(e) => setQuotation({ ...quotation, mobilizationPeriod: e.target.value })}
                    placeholder="e.g. 7 Calendar Days"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'الجدول الزمني للتسليم' : 'Delivery Timeline'}</label>
                  <input
                    type="text"
                    value={quotation.deliveryTimeline || ''}
                    onChange={(e) => setQuotation({ ...quotation, deliveryTimeline: e.target.value })}
                    placeholder="e.g. Within 30 days"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Exclusions */}
            <div className="p-4 border border-border rounded-xl space-y-3 bg-muted/10">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'الاستثناءات (غير مشمول بالعرض)' : 'Exclusions'}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newEx = [...(quotation.exclusions || []), isRtl ? 'بند استثناء جديد' : 'New Exclusion Item'];
                    setQuotation({ ...quotation, exclusions: newEx });
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  ➕ {isRtl ? 'إضافة استثناء' : 'Add Exclusion'}
                </button>
              </div>
              <div className="space-y-2">
                {(quotation.exclusions || []).map((ex: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={ex}
                      onChange={(e) => {
                        const list = [...quotation.exclusions];
                        list[idx] = e.target.value;
                        setQuotation({ ...quotation, exclusions: list });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = quotation.exclusions.filter((_: any, i: number) => i !== idx);
                        setQuotation({ ...quotation, exclusions: filtered });
                      }}
                      className="text-red-500 font-bold hover:underline"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Terms */}
            <div className="p-4 border border-border rounded-xl space-y-3 bg-muted/10">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'شروط وطريقة الدفع' : 'Payment Terms'}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newTerms = [...(quotation.paymentTerms || []), isRtl ? 'بند دفعة جديد' : 'New Payment Milestone'];
                    setQuotation({ ...quotation, paymentTerms: newTerms });
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  ➕ {isRtl ? 'إضافة دفعة' : 'Add Payment Term'}
                </button>
              </div>
              <div className="space-y-2">
                {(quotation.paymentTerms || []).map((term: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => {
                        const list = [...quotation.paymentTerms];
                        list[idx] = e.target.value;
                        setQuotation({ ...quotation, paymentTerms: list });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = quotation.paymentTerms.filter((_: any, i: number) => i !== idx);
                        setQuotation({ ...quotation, paymentTerms: filtered });
                      }}
                      className="text-red-500 font-bold hover:underline"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions details */}
            <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'الشروط والأحكام والمسؤوليات' : 'Terms & Conditions'}</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'الشروط العامة' : 'General Conditions'}</label>
                  <textarea
                    value={quotation.termsConditions?.general || ''}
                    onChange={(e) => setQuotation({ ...quotation, termsConditions: { ...quotation.termsConditions, general: e.target.value } })}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'مسؤوليات العميل' : 'Client Responsibilities'}</label>
                  <textarea
                    value={quotation.termsConditions?.clientResponsibilities || ''}
                    onChange={(e) => setQuotation({ ...quotation, termsConditions: { ...quotation.termsConditions, clientResponsibilities: e.target.value } })}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{isRtl ? 'مسؤوليات الاستشاري' : 'Consultant Responsibilities'}</label>
                  <textarea
                    value={quotation.termsConditions?.consultantResponsibilities || ''}
                    onChange={(e) => setQuotation({ ...quotation, termsConditions: { ...quotation.termsConditions, consultantResponsibilities: e.target.value } })}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings (Col 3) */}
          <div className="space-y-6">
            {/* Version & Workflow Status */}
            <div className="p-4 border border-border rounded-xl bg-muted/10 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'مراجعة الإصدار واعتماد العمليات' : 'Approval Workflow & Version'}</h4>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground">{isRtl ? 'حالة الاعتماد' : 'Approval Status'}</label>
                <select
                  value={quotation.currentStatus || 'Draft'}
                  onChange={(e) => setQuotation({ ...quotation, currentStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background font-bold text-foreground"
                >
                  <option value="Draft">Draft (مسودة)</option>
                  <option value="Submitted">Submitted (قيد التقديم)</option>
                  <option value="Approved">Approved (معتمد)</option>
                  <option value="Rejected">Rejected (مرفوض)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="block text-xs text-muted-foreground font-semibold">{isRtl ? 'أخر إصدار' : 'Latest Revision'}</span>
                <span className="text-xs font-bold font-mono">Rev #{quotation.versionHistory?.length || 1}</span>
              </div>
            </div>

            {/* Quotation Templates */}
            <div className="p-4 border border-border rounded-xl bg-muted/10 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'قوالب العروض الجاهزة' : 'Customize From Template'}</h4>
              <select
                value={quotation.templateType || 'Engineering Consultancy'}
                onChange={async (e) => {
                  const tmplType = e.target.value;
                  const confirmed = await window.api.dialog.confirm({
                    message: isRtl ? 'هل تريد تغيير القالب؟ سيؤدي ذلك لاستبدال نصوص المقدمة والبنود والمسؤوليات.' : 'Change template? This will replace the introduction text, scope of work, exclusions, and payment terms with defaults.',
                    title: isRtl ? 'تغيير القالب' : 'Change Template',
                    buttons: isRtl ? ['نعم', 'إلغاء'] : ['Yes', 'Cancel'],
                  });
                  if (confirmed) {
                    const sourceDefaults = isRtl ? TEMPLATE_DEFAULTS_AR : TEMPLATE_DEFAULTS;
                    const defaults = sourceDefaults[tmplType] || sourceDefaults['Engineering Consultancy'];
                    setQuotation({
                      ...quotation,
                      templateType: tmplType,
                      introduction: defaults.introduction,
                      scopeOfWork: defaults.scopeOfWork,
                      exclusions: defaults.exclusions,
                      paymentTerms: defaults.paymentTerms,
                      termsConditions: defaults.termsConditions
                    });
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
              >
                <option value="Engineering Consultancy">Engineering Consultancy</option>
                <option value="Design Services">Design Services (مخططات وتصاميم)</option>
                <option value="Supervision Services">Supervision Services (إشراف هندسي)</option>
                <option value="Quantity Surveying">Quantity Surveying (جداول كميات)</option>
                <option value="Project Management">Project Management (إدارة مشاريع)</option>
              </select>
            </div>

            {/* Signature Block settings */}
            <div className="p-4 border border-border rounded-xl bg-muted/10 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'التواقيع والاعتمادات' : 'Signatures Block'}</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Prepared By / إعداد"
                  value={quotation.signatureSection?.preparedBy || ''}
                  onChange={(e) => setQuotation({ ...quotation, signatureSection: { ...quotation.signatureSection, preparedBy: e.target.value } })}
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                />
                <input
                  type="text"
                  placeholder="Reviewed By / مراجعة"
                  value={quotation.signatureSection?.reviewedBy || ''}
                  onChange={(e) => setQuotation({ ...quotation, signatureSection: { ...quotation.signatureSection, reviewedBy: e.target.value } })}
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                />
                <input
                  type="text"
                  placeholder="Approved By / اعتماد"
                  value={quotation.signatureSection?.approvedBy || ''}
                  onChange={(e) => setQuotation({ ...quotation, signatureSection: { ...quotation.signatureSection, approvedBy: e.target.value } })}
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            {/* Branding details */}
            <div className="p-4 border border-border rounded-xl bg-muted/10 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'هوية الشركة والترويسة' : 'Company Branding'}</h4>
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={quotation.branding?.companyName || ''}
                  onChange={(e) => setQuotation({ ...quotation, branding: { ...quotation.branding, companyName: e.target.value } })}
                  className="w-full px-3 py-1.5 border border-border rounded-lg bg-background"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={quotation.branding?.address || ''}
                  onChange={(e) => setQuotation({ ...quotation, branding: { ...quotation.branding, address: e.target.value } })}
                  className="w-full px-3 py-1.5 border border-border rounded-lg bg-background"
                />
                <input
                  type="text"
                  placeholder="CR Number / السجل التجاري"
                  value={quotation.branding?.crNumber || ''}
                  onChange={(e) => setQuotation({ ...quotation, branding: { ...quotation.branding, crNumber: e.target.value } })}
                  className="w-full px-3 py-1.5 border border-border rounded-lg bg-background"
                />
                <input
                  type="text"
                  placeholder="VAT Number / الرقم الضريبي"
                  value={quotation.branding?.vatNumber || ''}
                  onChange={(e) => setQuotation({ ...quotation, branding: { ...quotation.branding, vatNumber: e.target.value } })}
                  className="w-full px-3 py-1.5 border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            {/* Revision Logs */}
            {quotation.versionHistory && quotation.versionHistory.length > 0 && (
              <div className="p-4 border border-border rounded-xl bg-muted/10 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">{isRtl ? 'أرشيف المراجعات' : 'Revision History'}</h4>
                <div className="space-y-2 text-[10px] max-h-40 overflow-y-auto">
                  {quotation.versionHistory.map((h: any, idx: number) => (
                    <div key={idx} className="border-b border-border pb-1.5">
                      <div className="flex justify-between font-bold">
                        <span>Rev #{h.version} ({h.status})</span>
                        <span>{h.updatedBy}</span>
                      </div>
                      <p className="text-muted-foreground">{new Date(h.updatedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDocument = () => {
    if (!quotation) return null;
    
    const meta = detailsJson?.metadata || {};
    const inputPrice = parseFloat(meta.totalPrice || '0') || 0;
    
    // Ensure effective items always reflect the actual entered price if single item or matching metadata
    let effectiveItems = quotation.items || [];
    if (inputPrice > 0 && (!effectiveItems.length || (effectiveItems.length === 1 && effectiveItems[0].total !== inputPrice))) {
      effectiveItems = [
        {
          id: effectiveItems[0]?.id || '1',
          itemNo: effectiveItems[0]?.itemNo || '1',
          description: project?.projectName || quotation.subject || effectiveItems[0]?.description || (isRtl ? 'أعمال استشارية ومساحية' : 'Engineering & Surveying Works'),
          unit: effectiveItems[0]?.unit || (isRtl ? 'مقطوع' : 'LS'),
          quantity: effectiveItems[0]?.quantity || 1,
          unitPrice: inputPrice,
          total: inputPrice * (effectiveItems[0]?.quantity || 1)
        }
      ];
    }
    
    // Calculate values
    let subtotal = 0;
    if (quotation.pricingType === 'lump_sum') {
      subtotal = inputPrice > 0 ? inputPrice : (quotation.lumpSumPrice || 0);
    } else {
      subtotal = effectiveItems.reduce((sum: number, item: any) => sum + item.total, 0);
      if (subtotal === 0 && inputPrice > 0) {
        subtotal = inputPrice;
      }
    }
    const vatAmount = (subtotal * (quotation.vatRate || 15)) / 100;
    const discount = quotation.discount || 0;
    const grandTotal = subtotal + vatAmount - discount;

    return (
      <div className="space-y-6">
        {/* Floating actions in preview mode */}
        <div className="flex flex-wrap justify-between items-center bg-card border border-border p-4 rounded-xl shadow-sm print:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>{isRtl ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
            </button>
            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              📝 {isRtl ? 'تصدير Word' : 'Export Word'}
            </button>
            {quotation.pricingType === 'itemized' && (
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                📊 {isRtl ? 'تصدير Excel (جدول الكميات)' : 'Export Excel (BOQ)'}
              </button>
            )}
          </div>
          <button
            onClick={() => setShowConvertModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all"
          >
            🚀 {isRtl ? 'تحويل إلى مشروع نشط' : 'Convert to Active Project'}
          </button>
        </div>

        {/* Beautiful A4 container sheet */}
        <div className="bg-white text-slate-800 p-8 md:p-12 border border-slate-200 rounded-2xl shadow-md max-w-4xl mx-auto space-y-8 font-sans print:shadow-none print:border-none print:p-0 print:m-0" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-primary pb-4">
            <div>
              <DmcLogo className="mb-2.5" />
              <h2 className="text-xl font-bold text-primary">{quotation.branding?.companyName || 'Dar Makkah Engineering'}</h2>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs">{quotation.branding?.address || 'Makkah, Saudi Arabia'}</p>
              <p className="text-[10px] text-slate-500">Tel: {quotation.branding?.phone || ''} | CR: {quotation.branding?.crNumber || ''}</p>
            </div>
            <div className="text-end text-xs space-y-1">
              <div className="font-bold text-slate-900">{isRtl ? 'عرض سعر فني ومالي' : 'TECHNICAL & COMMERCIAL PROPOSAL'}</div>
              <div className="text-slate-500">Ref: <span className="font-mono text-slate-900 font-bold">{quotation.refNumber}</span></div>
              <div className="text-slate-500">Date: <span className="font-mono text-slate-900">{quotation.quotationDate}</span></div>
              <div className="text-slate-500">VAT Reg: <span className="font-mono text-slate-900">{quotation.branding?.vatNumber || ''}</span></div>
            </div>
          </div>

          {/* Client Details block */}
          <div className="p-4 bg-slate-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block font-bold text-slate-500">{isRtl ? 'مقدم إلى:' : 'To:'}</span>
              <span className="font-bold text-slate-900 text-sm">{quotation.toClientCompany}</span>
              {quotation.attentionTo && (
                <span className="block mt-1 text-slate-600">{isRtl ? 'عناية:' : 'Attention:'} {quotation.attentionTo}</span>
              )}
            </div>
            <div>
              <span className="block font-bold text-slate-500">{isRtl ? 'الموضوع:' : 'Subject:'}</span>
              <span className="font-bold text-slate-900 text-sm">{quotation.subject}</span>
              {project?.locationText && (
                <span className="block mt-1 text-slate-600">📍 {project.locationText}</span>
              )}
            </div>
          </div>

          {/* Intro */}
          <p className="text-xs leading-relaxed text-slate-700">{quotation.introduction}</p>

          {/* Scope of Work */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-slate-100 pb-1.5">
              {isRtl ? 'أولاً: نطاق الأعمال الهندسية والاستشارية' : '1. SCOPE OF ENGINEERING SERVICES'}
            </h3>
            <div className="space-y-3 text-xs">
              {(quotation.scopeOfWork || []).map((scope: any, idx: number) => (
                <div key={scope.id} className="space-y-1">
                  <div className="font-bold text-slate-950">{idx + 1}. {scope.title}</div>
                  <p className="text-slate-600 ps-4">{scope.description}</p>
                  {scope.notes && (
                    <p className="text-[11px] text-slate-500 ps-4 italic">({isRtl ? 'ملاحظة' : 'Note'}: {scope.notes})</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-slate-100 pb-1.5">
              {isRtl ? 'ثانياً: العرض المالي وجدول التسعير' : '2. COMMERCIAL PROPOSAL & BOQ'}
            </h3>
            
            {quotation.pricingType === 'lump_sum' ? (
              <div className="p-3 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{isRtl ? 'إجمالي قيمة الأعمال الفنية المقترحة' : 'Total lump sum for proposed engineering works'}</span>
                <span className="font-bold text-primary font-mono text-sm">{subtotal} {quotation.currency}</span>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-slate-700 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-2 border-e border-slate-200 text-start w-12">{isRtl ? 'بند' : 'Item'}</th>
                      <th className="p-2 border-e border-slate-200 text-start">{isRtl ? 'الوصف' : 'Description'}</th>
                      <th className="p-2 border-e border-slate-200 text-start w-16">{isRtl ? 'الوحدة' : 'Unit'}</th>
                      <th className="p-2 border-e border-slate-200 text-start w-12">{isRtl ? 'الكمية' : 'Qty'}</th>
                      <th className="p-2 border-e border-slate-200 text-start w-20">{isRtl ? 'سعر الوحدة' : 'Unit Price'}</th>
                      <th className="p-2 text-start w-24">{isRtl ? 'الإجمالي' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectiveItems.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                        <td className="p-2 border-e border-slate-200 font-mono">{item.itemNo}</td>
                        <td className="p-2 border-e border-slate-200">{item.description}</td>
                        <td className="p-2 border-e border-slate-200 text-center">{item.unit}</td>
                        <td className="p-2 border-e border-slate-200 text-center">{item.quantity}</td>
                        <td className="p-2 border-e border-slate-200 font-mono">{item.unitPrice}</td>
                        <td className="p-2 font-mono font-bold text-slate-900">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Calculations Blocks */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{isRtl ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-mono text-slate-950 font-bold">{subtotal} {quotation.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRtl ? `ضريبة القيمة المضافة (${quotation.vatRate || 15}%):` : `VAT (${quotation.vatRate || 15}%):`}</span>
                  <span className="font-mono text-slate-950 font-bold">{vatAmount} {quotation.currency}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{isRtl ? 'الخصم الممنوح:' : 'Discount:'}</span>
                    <span className="font-mono">- {discount} {quotation.currency}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm text-slate-900 font-extrabold">
                  <span>{isRtl ? 'المجموع الإجمالي:' : 'Grand Total:'}</span>
                  <span className="font-mono text-primary">{grandTotal} {quotation.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Duration & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Duration */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">{isRtl ? 'ثالثاً: مدة المشروع وجدول التنفيذ' : '3. PROJECT SCHEDULE'}</h4>
              <ul className="list-disc ps-4 space-y-1 text-slate-600">
                <li><b>{isRtl ? 'مدة التنفيذ:' : 'Execution Period:'}</b> {quotation.executionDuration}</li>
                <li><b>{isRtl ? 'فترة التجهيز:' : 'Mobilization Period:'}</b> {quotation.mobilizationPeriod}</li>
                <li><b>{isRtl ? 'التسليم النهائي:' : 'Final Delivery:'}</b> {quotation.deliveryTimeline}</li>
              </ul>
            </div>

            {/* Exclusions */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">{isRtl ? 'رابعاً: الاستثناءات والبنود غير المشمولة' : '4. EXCLUSIONS'}</h4>
              <ul className="list-disc ps-4 space-y-1 text-slate-600">
                {(quotation.exclusions || []).map((ex: string, idx: number) => (
                  <li key={idx}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Terms & Validity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Payment terms */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">{isRtl ? 'خامساً: شروط وآلية الدفع' : '5. PAYMENT TERMS'}</h4>
              <ul className="list-decimal ps-4 space-y-1 text-slate-600">
                {(quotation.paymentTerms || []).map((term: string, idx: number) => (
                  <li key={idx}>{term}</li>
                ))}
              </ul>
            </div>

            {/* Validity & Terms */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">{isRtl ? 'سادساً: الصلاحية والشروط العامة' : '6. VALIDITY & T&Cs'}</h4>
              <p className="text-slate-600 leading-relaxed">
                • {isRtl ? `هذا العرض صالح لمدة ${quotation.validityDays || 30} يوماً من تاريخ الإصدار.` : `This quotation is valid for ${quotation.validityDays || 30} days from the issue date.`}<br/>
                • {quotation.termsConditions?.general || ''}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t border-slate-200 pt-6 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-500 font-sans">
            <div className="space-y-3">
              <span className="block font-bold text-slate-700">{isRtl ? 'إعداد' : 'Prepared By'}</span>
              <span className="block text-slate-900 font-semibold">{quotation.signatureSection?.preparedBy || ''}</span>
              <div className="h-8 flex items-center justify-center italic text-primary/40 font-mono">{isRtl ? 'توقيع رقمي معتمد' : 'Digitally Signed'}</div>
            </div>
            <div className="space-y-3 border-x border-slate-100">
              <span className="block font-bold text-slate-700">{isRtl ? 'تدقيق' : 'Reviewed By'}</span>
              <span className="block text-slate-900 font-semibold">{quotation.signatureSection?.reviewedBy || ''}</span>
              <div className="h-8 flex items-center justify-center italic text-primary/40 font-mono">{isRtl ? 'توقيع رقمي معتمد' : 'Digitally Signed'}</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <span className="block font-bold text-slate-700">{isRtl ? 'اعتماد وختم الشركة' : 'Approved & Sealed'}</span>
              <span className="block text-slate-900 font-semibold">{quotation.signatureSection?.approvedBy || ''}</span>
              {/* DMC Official Seal Stamp */}
              <div className="relative flex items-center justify-center pt-1">
                <img
                  src={DMC_STAMP_BASE64}
                  alt="DMC Official Stamp"
                  className="w-32 h-32 object-contain drop-shadow-md select-none pointer-events-none transform -rotate-3 hover:rotate-0 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PlaceholderWrapper title={`${t('routes.projectDetails')} - ${project.projectNumber}`} icon={FileText}>
      <div className="space-y-6">
        {/* Top Controls Action Bar */}
        <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl shadow-sm print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-accent transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isRtl ? 'رجوع' : 'Back'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 text-xs font-bold rounded-lg transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>{t('common.export')}</span>
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg transition-all"
            >
              {t('common.edit')}
            </button>
            {userRole !== 'Staff' && (
              <button
                onClick={handleDeleteProject}
                className="px-3 py-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold rounded-lg transition-all"
              >
                {t('common.delete')}
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection Bar (Price Offers Only) */}
        {project.workType === 'PRICE_OFFERS' && (
          <div className="flex gap-2 border-b border-border pb-px print:hidden">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              📊 {isRtl ? 'حالة سير العمل والمستندات' : 'Workflow & Attachments'}
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'builder' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              ✍️ {isRtl ? 'منشئ العرض والبنود' : 'Proposal Builder'}
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'document' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              📄 {isRtl ? 'عرض المستند والتصدير' : 'Proposal Preview & Export'}
            </button>
          </div>
        )}

        {/* Main Tab Content */}
        {project.workType !== 'PRICE_OFFERS' || activeTab === 'overview' ? renderOverview() : null}
        {project.workType === 'PRICE_OFFERS' && activeTab === 'builder' ? renderBuilder() : null}
        {project.workType === 'PRICE_OFFERS' && activeTab === 'document' ? renderDocument() : null}

      </div>

      {/* Edit Form Modal */}
      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        isEdit={true}
        editProjectId={project.id}
        workTypeArg={project.workType}
        onSuccess={loadProjectData}
      />

      {/* Convert Project Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-md font-bold text-foreground">{isRtl ? 'تحويل العرض إلى مشروع نشط' : 'Convert Proposal to Active Project'}</h3>
            <p className="text-xs text-muted-foreground">{isRtl ? 'اختر نوع المعاملة أو المشروع المراد إنشاؤه:' : 'Select the target project workflow type:'}</p>
            
            <div className="space-y-3">
              <select
                value={targetWorkType}
                onChange={(e) => setTargetWorkType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background font-semibold"
              >
                <option value="SURVEY_TRANSFER">{isRtl ? 'قرار نقل مساحي' : 'Survey Transfer'}</option>
                <option value="REPORTS">{isRtl ? 'تقارير فنية' : 'Reports & Studies'}</option>
                <option value="SURVEY_SKETCH">{isRtl ? 'كروكي مساحي' : 'Survey Sketch'}</option>
                <option value="BALADI_TRANSACTION">{isRtl ? 'معاملة بلدي' : 'Baladi Transaction'}</option>
                <option value="SURVEY_DECISION">{isRtl ? 'قرار مساحي' : 'Survey Decision'}</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold font-sans">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-3 py-2 border border-border rounded-lg hover:bg-accent"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConvertProject}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg animate-pulse"
              >
                {isRtl ? 'تأكيد التحويل' : 'Confirm Conversion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirm Delete Modal for Project Details Page */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title={isRtl ? 'تأكيد حذف المشروع نهائياً' : 'Delete Project Permanently'}
        message={isRtl ? 'هل أنت متأكد من حذف هذا المشروع نهائياً؟ لا يمكن التراجع عن هذه العملية.' : 'Are you sure you want to delete this project permanently? This action cannot be undone.'}
        itemName={detailsJson?.projectName || project?.projectName || project?.clientName}
        itemBadge={project?.projectNumber}
        isLoading={isDeleting}
        onConfirm={handleDeleteProject}
        onClose={() => setShowDeleteModal(false)}
      />
    </PlaceholderWrapper>
  );
}

// 10. Settings - Users
export interface UserItem {
  id: string;
  fullName: string;
  iqamaId: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export function SettingsUsersPage(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string>('Staff');

  // Form states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Add User inputs
  const [fullName, setFullName] = useState('');
  const [iqamaId, setIqamaId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Staff');
  const [tempPassword, setTempPassword] = useState('');

  // Edit User inputs
  const [editFullName, setEditFullName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editRole, setEditRole] = useState('Staff');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');

  const isRtl = i18n.language === 'ar';

  const loadUsersData = async () => {
    try {
      const userProfile = await window.api.secureStorage.getItem('user');
      if (userProfile) {
        const parsed = JSON.parse(userProfile);
        setCurrentRole(parsed.role || 'Staff');
        if (parsed.role !== 'Admin') {
          setLoading(false);
          return;
        }
      }

      const token = await window.api.secureStorage.getItem('accessToken');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        throw new Error('Session expired or invalid. Please log out and log in again. / انتهت صلاحية الجلسة. يرجى تسجيل الخروج وإعادة الدخول.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users / فشل جلب المستخدمين');
      }

      const data = await response.json();
      setUsers(data as UserItem[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Email
    if (!iqamaId || !iqamaId.includes('@')) {
      setError(
        isRtl
          ? 'تنسيق البريد الإلكتروني غير صالح. / Invalid email address format.'
          : 'Invalid email address format.'
      );
      return;
    }

    if (!/^(05\d{8}|\+9665\d{8})$/.test(phoneNumber)) {
      setError(t('common.invalidPhone'));
      return;
    }

    try {
      const token = await window.api.secureStorage.getItem('accessToken');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          iqamaId,
          phoneNumber,
          role,
          temporaryPassword: tempPassword || 'Password123'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      setAddOpen(false);
      setFullName('');
      setIqamaId('');
      setPhoneNumber('');
      setRole('Staff');
      setTempPassword('');
      loadUsersData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError(null);

    if (!/^(05\d{8}|\+9665\d{8})$/.test(editPhoneNumber)) {
      setError(t('common.invalidPhone'));
      return;
    }

    try {
      const token = await window.api.secureStorage.getItem('accessToken');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFullName,
          phoneNumber: editPhoneNumber,
          role: editRole,
          isActive: editIsActive,
          password: editPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }

      setEditOpen(false);
      setSelectedUser(null);
      setEditPassword('');
      loadUsersData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const [deactivateUserTarget, setDeactivateUserTarget] = useState<UserItem | null>(null);
  const [isDeactivatingUser, setIsDeactivatingUser] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserItem | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const handleDeactivate = async () => {
    if (!deactivateUserTarget) return;
    setIsDeactivatingUser(true);
    try {
      const token = await window.api.secureStorage.getItem('accessToken');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${deactivateUserTarget.id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      setDeactivateUserTarget(null);
      loadUsersData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeactivatingUser(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserTarget) return;
    setIsDeletingUser(true);
    try {
      const token = await window.api.secureStorage.getItem('accessToken');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${deleteUserTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete user');
      }

      setDeleteUserTarget(null);
      loadUsersData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const maskIqamaId = (email: string) => {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `*@${domain}`;
    return name.substring(0, 2) + '***@' + domain;
  };

  if (currentRole !== 'Admin') {
    return (
      <PlaceholderWrapper title={t('nav.users')} icon={Users}>
        <div className="border border-destructive/20 bg-destructive/5 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center shadow-sm">
          <span className="text-xl">⚠️</span>
          <h4 className="font-bold text-md">{isRtl ? 'غير مصرح لك بالوصول' : 'Access Denied'}</h4>
          <p className="text-xs max-w-sm">
            {isRtl
              ? 'فقط المشرفين مخولين بالوصول وإدارة المستخدمين والصلاحيات.'
              : 'Only system Administrators are authorized to view and manage user accounts.'}
          </p>
          <Link to="/dashboard" className="text-primary hover:underline text-xs font-semibold pt-2">
            {isRtl ? 'العودة للوحة التحكم' : 'Return to Dashboard'}
          </Link>
        </div>
      </PlaceholderWrapper>
    );
  }

  return (
    <PlaceholderWrapper title={t('nav.users')} icon={Users}>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold">{isRtl ? 'المستخدمين والصلاحيات' : 'User Accounts & Roles'}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl ? 'إدارة مشغلي النظام، تعيين الأدوار، ومتابعة النشاط' : 'Manage system operators, roles, and status'}
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isRtl ? 'إضافة مستخدم' : 'Add User'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-start text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider text-start">
                  <th className="px-6 py-3 text-start">{isRtl ? 'الاسم بالكامل' : 'Full Name'}</th>
                  <th className="px-6 py-3 text-start">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</th>
                  <th className="px-6 py-3 text-start">{isRtl ? 'رقم الجوال' : 'Phone Number'}</th>
                  <th className="px-6 py-3 text-start">{isRtl ? 'الدور / الصلاحية' : 'Role'}</th>
                  <th className="px-6 py-3 text-start">{isRtl ? 'حالة الحساب' : 'Status'}</th>
                  <th className="px-6 py-3 text-start">{isRtl ? 'آخر تسجيل دخول' : 'Last Login'}</th>
                  <th className="px-6 py-3 text-start">{isRtl ? 'الخيارات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/10 transition-all">
                    <td className="px-6 py-4 font-bold text-foreground">{user.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{maskIqamaId(user.iqamaId)}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{user.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        user.role === 'Admin'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : user.role === 'DepartmentManager'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-primary/10 text-primary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.isActive
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.isActive ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString(i18n.language)
                        : (isRtl ? 'لم يسجل دخول بعد' : 'Never')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditFullName(user.fullName);
                            setEditPhoneNumber(user.phoneNumber);
                            setEditRole(user.role);
                            setEditIsActive(user.isActive);
                            setEditOpen(true);
                          }}
                          className="p-1 bg-secondary text-secondary-foreground border border-border rounded shadow-sm hover:bg-accent text-xs transition-all"
                          title={isRtl ? 'تعديل' : 'Edit User'}
                        >
                          ✎
                        </button>
                        {user.isActive && (
                          <button
                            onClick={() => setDeactivateUserTarget(user)}
                            className="p-1 bg-destructive/10 text-destructive border border-destructive/20 rounded shadow-sm hover:bg-destructive/20 text-xs transition-all"
                            title={isRtl ? 'إلغاء التنشيط' : 'Deactivate Account'}
                          >
                            ✕
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteUserTarget(user)}
                          className="p-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded shadow-sm hover:bg-red-500/20 text-xs transition-all"
                          title={isRtl ? 'حذف الحساب نهائياً' : 'Delete User Permanently'}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add User Modal */}
        {addOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div>
                <h3 className="text-lg font-bold">{isRtl ? 'إضافة مستخدم جديد' : 'Register New User'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRtl ? 'تسجيل مستخدم جديد وتعيين صلاحيات الدور له.' : 'Register user and assign role privileges.'}
                </p>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'الاسم بالكامل' : 'Full Name'} *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'البريد الإلكتروني' : 'Email Address'} *</label>
                  <input
                    type="email"
                    value={iqamaId}
                    onChange={(e) => setIqamaId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'رقم الجوال' : 'Phone Number'} *</label>
                  <input
                    type="text"
                    placeholder="05xxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'الدور والجروب' : 'Role / Permissions Group'} *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  >
                    <option value="Staff">{isRtl ? 'موظف مساحي / Staff' : 'Staff'}</option>
                    <option value="DepartmentManager">{isRtl ? 'مدير القسم / Department Manager' : 'Department Manager'}</option>
                    <option value="Admin">{isRtl ? 'مشرف النظام / Admin' : 'Admin'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'كلمة المرور المؤقتة' : 'Temporary Password'} *</label>
                  <input
                    type="password"
                    placeholder="Password123"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/95 shadow-sm"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editOpen && selectedUser && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div>
                <h3 className="text-lg font-bold">{isRtl ? 'تعديل بيانات المستخدم' : 'Edit Operator Account'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRtl ? 'تعديل بيانات الاعتماد للمستخدم: ' : 'Editing credentials for: '}
                  {selectedUser.fullName}
                </p>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'الاسم بالكامل' : 'Full Name'} *</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    type="email"
                    value={selectedUser.iqamaId}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground text-sm focus:outline-none font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'رقم الجوال' : 'Phone Number'} *</label>
                  <input
                    type="text"
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'الدور والجروب' : 'Role / Permissions Group'} *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  >
                    <option value="Staff">{isRtl ? 'موظف مساحي / Staff' : 'Staff'}</option>
                    <option value="DepartmentManager">{isRtl ? 'مدير القسم / Department Manager' : 'Department Manager'}</option>
                    <option value="Admin">{isRtl ? 'مشرف النظام / Admin' : 'Admin'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'حالة تنشيط الحساب' : 'Account Status'} *</label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  >
                    <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{isRtl ? 'غير نشط' : 'Inactive (Deactivated)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{isRtl ? 'تغيير كلمة المرور (اختياري)' : 'Reset Password (Optional)'}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditOpen(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/95 shadow-sm"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modern Confirm Deactivate Modal for Users */}
        <ConfirmModal
          isOpen={!!deactivateUserTarget}
          variant="warning"
          title={isRtl ? 'تأكيد إلغاء تنشيط الحساب' : 'Confirm Account Deactivation'}
          message={isRtl ? `هل أنت متأكد من تعطيل حساب "${deactivateUserTarget?.fullName}"؟ لن يتمكن المستخدم من الدخول حتى إعادة التنشيط.` : `Are you sure you want to deactivate the account for "${deactivateUserTarget?.fullName}"?`}
          itemName={deactivateUserTarget?.fullName}
          itemBadge={deactivateUserTarget?.role}
          description={deactivateUserTarget?.iqamaId}
          confirmLabel={isRtl ? 'إلغاء التنشيط' : 'Deactivate'}
          isLoading={isDeactivatingUser}
          onConfirm={handleDeactivate}
          onClose={() => setDeactivateUserTarget(null)}
        />

        {/* Modern Confirm Delete Modal for Users */}
        <ConfirmModal
          isOpen={!!deleteUserTarget}
          title={isRtl ? 'تحذير حذف حساب المستخدم نهائياً' : 'Warning: Delete User Account Permanently'}
          message={isRtl ? `سيتم حذف حساب "${deleteUserTarget?.fullName}" نهائياً من قاعدة البيانات ولن يمكن استعادته.` : `The user account for "${deleteUserTarget?.fullName}" will be permanently removed.`}
          itemName={deleteUserTarget?.fullName}
          itemBadge={deleteUserTarget?.role}
          description={deleteUserTarget?.iqamaId}
          isLoading={isDeletingUser}
          onConfirm={handleDelete}
          onClose={() => setDeleteUserTarget(null)}
        />
      </div>
    </PlaceholderWrapper>
  );
}

// 11. Settings - General
export function SettingsGeneralPage(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [officeName, setOfficeName] = useState('Masaha Surveying Office');
  const [taxNumber, setTaxNumber] = useState('300012345600003');
  const [syncInterval, setSyncInterval] = useState('5');
  const [oneDrivePath, setOneDrivePath] = useState('');

  useEffect(() => {
    window.api.localDb.getMetadata('officeName').then((val) => val && setOfficeName(val));
    window.api.localDb.getMetadata('taxNumber').then((val) => val && setTaxNumber(val));
    window.api.localDb.getMetadata('syncInterval').then((val) => val && setSyncInterval(val));
    window.api.localDb.getMetadata('oneDrivePath').then((val) => {
      if (val && val !== 'C:\\Users\\maxpr\\OneDrive\\قسم أعمال المساحة' && !val.includes('C:\\Users\\maxpr')) {
        setOneDrivePath(val);
      } else {
        setOneDrivePath('D:\\OneDrive\\مشاريع فرع مكة المكرمة\\قسم أعمال المساحة');
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      await window.api.localDb.setMetadata('officeName', officeName);
      await window.api.localDb.setMetadata('taxNumber', taxNumber);
      await window.api.localDb.setMetadata('syncInterval', syncInterval);
      await window.api.localDb.setMetadata('oneDrivePath', oneDrivePath);
      alert(isRtl ? 'تم حفظ الإعدادات العامة بنجاح' : 'General settings updated successfully');
    } catch (e) {
      console.error(e);
      alert('Error saving settings');
    }
  };

  return (
    <PlaceholderWrapper title={t('nav.general')} icon={Settings}>
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6 max-w-2xl">
        <div>
          <h3 className="text-lg font-bold">{isRtl ? 'الإعدادات العامة للبلدية/المكتب' : 'General Office Settings'}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isRtl ? 'تخصيص الهوية البصرية، شعار المكتب، وإعدادات المزامنة' : 'Configure visual branding, office logo, and sync behavior'}
          </p>
        </div>

        <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'اسم المكتب المساحي' : 'Office Branding Name'}</span>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'الرقم الضريبي للمكتب' : 'Tax Registration Number'}</span>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <span className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'مجلد مزامنة ون درايف المشترك' : 'OneDrive Shared Folder Path'}</span>
            <input
              type="text"
              value={oneDrivePath}
              onChange={(e) => setOneDrivePath(e.target.value)}
              placeholder="e.g. C:\Users\user\OneDrive\قسم أعمال المساحة"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2 col-span-2">
            <span className="block text-xs font-bold text-muted-foreground mb-1.5">{isRtl ? 'تواتر المزامنة التلقائية (دقائق)' : 'Sync Check Interval (minutes)'}</span>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none"
            >
              <option value="1">1 {isRtl ? 'دقيقة' : 'minute'}</option>
              <option value="5">5 {isRtl ? 'دقائق' : 'minutes'}</option>
              <option value="15">15 {isRtl ? 'دقيقة' : 'minutes'}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/95 shadow-sm"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </PlaceholderWrapper>
  );
}

// 12. Support
export function SupportPage(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [whatsappNum] = useState('966500000000');
  const [supportEmail] = useState('support@masahadesk.com');
  const appVersion = 'v1.0.0-production';

  const handleWhatsApp = () => {
    // Opens WhatsApp native link
    window.open(`https://wa.me/${whatsappNum}?text=Hello%20MasahaDesk%20Support`, '_blank');
  };

  const handleEmail = () => {
    // Opens mailto
    window.open(`mailto:${supportEmail}?subject=MasahaDesk%20Support%20Request%20(${appVersion})`);
  };

  return (
    <PlaceholderWrapper title={t('nav.support')} icon={HelpCircle}>
      <div className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6 max-w-xl text-center flex flex-col items-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-sm">
          💡
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{isRtl ? 'الدعم الفني والمساعدة' : 'Technical Support Widget'}</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mx-auto">
            {isRtl
              ? 'هل تواجه أي مشكلة فنية أو استفسار مساحي؟ يمكنك التواصل المباشر مع فريق الدعم الفني بالنقر أدناه.'
              : 'Having issues or questions with the system? Reach out to support agents in one tap.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md pt-4">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-green-200 bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-xs rounded-xl hover:bg-green-500/20 transition-all shadow-sm"
          >
            <MessageCircle className="h-4.5 w-4.5" />
            <span>{isRtl ? 'واتساب الدعم المباشر' : 'WhatsApp Support'}</span>
          </button>

          <button
            onClick={handleEmail}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-primary/20 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary/20 transition-all shadow-sm"
          >
            <Mail className="h-4.5 w-4.5" />
            <span>{isRtl ? 'مراسلة الدعم بالبريد' : 'Email Support'}</span>
          </button>
        </div>

        <div className="border-t border-border pt-4 w-full text-[10px] text-muted-foreground font-mono">
          <span>{isRtl ? 'إصدار التطبيق الحالي: ' : 'App Reference Build: '} {appVersion}</span>
        </div>
      </div>
    </PlaceholderWrapper>
  );
}

// --- ORIGINAL LOGIN PAGES FROM MODULE 2 ---

// 1. Login
export function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [iqamaId, setIqamaId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    window.api.secureStorage.getItem('accessToken').then((token) => {
      if (token) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Email
    if (!iqamaId || !iqamaId.includes('@')) {
      setError(
        isRtl
          ? 'تنسيق البريد الإلكتروني غير صالح. / Invalid email address format.'
          : 'Invalid email address format.'
      );
      return;
    }

    if (!password) {
      setError(isRtl ? 'كلمة المرور مطلوبة.' : 'Password is required.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iqamaId, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (isRtl ? 'فشل التحقق من الهوية.' : 'Authentication failed.'));
      }

      // Successful login - save credentials and navigate directly to dashboard
      await window.api.secureStorage.setItem('accessToken', data.accessToken);
      await window.api.secureStorage.setItem('refreshToken', data.refreshToken);
      await window.api.secureStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (isRtl ? 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071524] flex items-center justify-center p-4 md:p-8 select-none">
      {/* Container matching image dual-tone split */}
      <div className="w-full max-w-5xl bg-[#0b2034] border border-[#193a59] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[580px] animate-reveal" dir="ltr">
        
        {/* Left Side: Deep Navy Form Panel */}
        <div className="w-full md:w-[45%] bg-[#0b2034] text-[#f5efe6] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
          
          {/* Logo & Branding */}
          <div className="space-y-3">
            <div className="flex justify-center text-[#dfceb3]">
              <DmcLogo className="h-12" />
            </div>
            <div className="h-[1px] bg-[#dfceb3]/20 w-24 mx-auto my-3" />
            <h3 className="text-xs text-center text-[#dfceb3]/80 font-medium">
              {isRtl ? 'نظام إدارة قسم المساحة' : 'Surveying Department Management'}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 my-6">
            {error && (
              <div className="bg-red-500/20 text-red-100 text-xs p-3.5 rounded-xl border border-red-500/30 font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#dfceb3]/90 mb-1.5 text-start">
                {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={iqamaId}
                onChange={(e) => setIqamaId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#071524] text-[#f5efe6] border border-[#193a59] placeholder-[#9db1c3]/50 focus:outline-none focus:ring-2 focus:ring-[#dfceb3] text-sm font-medium transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#dfceb3]/90 mb-1.5 text-start">
                {isRtl ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#071524] text-[#f5efe6] border border-[#193a59] placeholder-[#9db1c3]/50 focus:outline-none focus:ring-2 focus:ring-[#dfceb3] text-sm font-medium transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#dfceb3] hover:bg-[#d4c1a3] text-[#0b2034] font-extrabold rounded-xl text-center shadow-lg shadow-[#dfceb3]/10 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-6 text-sm"
            >
              {loading ? (
                <span>{isRtl ? 'جاري التحقق...' : 'Logging in...'}</span>
              ) : (
                <>
                  <span>{isRtl ? 'تسجيل الدخول / Login' : 'Login / تسجيل الدخول'}</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer Controls */}
          <div className="flex justify-between items-center text-xs text-[#dfceb3]/70 pt-2">
            <button
              type="button"
              onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}
              className="hover:text-white font-bold transition-all"
            >
              {isRtl ? 'English' : 'العربية'}
            </button>
            <span className="font-mono text-[10px]">v1.2.0</span>
          </div>
        </div>

        {/* Right Side: Sand Beige Gold Branding Panel matching uploaded image */}
        <div className="hidden md:flex w-[55%] relative overflow-hidden bg-[#dfceb3] text-[#0b2034] p-10 flex-col items-center justify-center text-center">
          <div className="survey-grid-bg absolute inset-0 opacity-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <DmcLogo className="scale-150 transform text-[#0b2034] mb-4" />
            <div className="h-1 w-16 bg-[#0b2034] rounded-full my-2" />
            <h3 className="text-xl font-black tracking-tight text-[#0b2034]">
              {isRtl ? 'حلول مساحية هندسية متكاملة' : 'Integrated Surveying & Engineering Solutions'}
            </h3>
            <p className="text-xs font-semibold text-[#0b2034]/80 max-w-sm leading-relaxed">
              {isRtl
                ? 'دار مكة للاستشارات الهندسية — تأسست عام 1986. المنظومة الذكية لإدارة الرفع والتنزيل المساحي، القرارات المساحية ومعاملات منصة بلدي.'
                : 'Dar Makkah Engineering Consultancy — Established 1986. Surveying, municipal decisions, and Baladi transactions workspace.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. OTP Verification
export function VerifyOtpPage(): React.ReactElement {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const iqamaId = searchParams.get('iqamaId') || '';
  const mockOtp = searchParams.get('mockOtp') || '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes expiry
  const [cooldown, setCooldown] = useState(60); // 60 seconds resend cooldown
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!iqamaId) {
      navigate('/login');
    }
  }, [iqamaId, navigate]);

  // Expiry Timer (5 minutes)
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Resend Cooldown (60s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow numbers only
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // keep last digit
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Auto-focus previous box on Backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join('');
    if (code.length < 6) {
      setError(isRtl ? 'الرجاء إدخال الرمز المكون من 6 أرقام كاملاً.' : 'Please enter the full 6-digit code.');
      return;
    }

    if (timer <= 0) {
      setError(isRtl ? 'انتهت صلاحية رمز التحقق. الرجاء طلب رمز جديد.' : 'The verification code has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iqamaId, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      // Save tokens securely in Electron safeStorage
      await window.api.secureStorage.setItem('accessToken', data.accessToken);
      await window.api.secureStorage.setItem('refreshToken', data.refreshToken);
      await window.api.secureStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (isRtl ? 'فشل التحقق. الرجاء المحاولة مرة أخرى.' : 'Verification failed. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iqamaId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code.');
      }

      setTimer(300); // Reset timer
      setCooldown(60); // Reset cooldown
      setOtp(Array(6).fill('')); // Clear inputs
      inputRefs.current[0]?.focus();

      // Update mockOtp param in URL
      if (data.mockOtp) {
        setSearchParams({ iqamaId, mockOtp: data.mockOtp });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (isRtl ? 'فشل إعادة إرسال رمز التحقق.' : 'Failed to resend verification code.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#071524] flex items-center justify-center p-4 md:p-8 select-none">
      {/* Container matching DMC dual-tone branding */}
      <div className="w-full max-w-5xl bg-[#0b2034] border border-[#193a59] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[580px] animate-reveal" dir="ltr">
        
        {/* Left Side: Deep Navy Form Panel */}
        <div className="w-full md:w-[45%] bg-[#0b2034] text-[#f5efe6] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
          
          {/* Logo & Branding */}
          <div className="space-y-3">
            <div className="flex justify-center text-[#dfceb3]">
              <DmcLogo className="h-12" />
            </div>
            <div className="h-[1px] bg-[#dfceb3]/20 w-24 mx-auto my-3" />
            <h3 className="text-xs text-center text-[#dfceb3]/80 font-medium">
              {isRtl ? 'التحقق من الهوية' : 'Identity Verification'}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6 my-6">
            {error && (
              <div className="bg-red-500/20 text-red-100 text-xs p-3.5 rounded-xl border border-red-500/30 font-medium">
                {error}
              </div>
            )}

            {mockOtp && (
              <div className="bg-[#dfceb3]/10 border border-[#dfceb3]/30 text-[#dfceb3] rounded-xl p-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm">
                <span>🔑</span>
                <span>رمز التجربة: {mockOtp}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#dfceb3]/90 text-center">
                {isRtl ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter 6-digit verification code'}
              </label>
              <div className="flex justify-center gap-1.5" dir="ltr">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[i] = el)}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-12 text-center text-xl font-extrabold rounded-xl bg-[#071524] text-[#f5efe6] border border-[#193a59] focus:outline-none focus:ring-2 focus:ring-[#dfceb3] transition-all font-mono"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="text-center text-xs font-medium">
              {timer > 0 ? (
                <span className="text-[#dfceb3]/70">
                  {isRtl ? 'ينتهي الرمز خلال:' : 'Code expires in:'}{' '}
                  <span className="text-[#f5efe6] font-bold">{formatTime(timer)}</span>
                </span>
              ) : (
                <span className="text-red-300 font-bold">{isRtl ? 'انتهت صلاحية الرمز' : 'Code Expired'}</span>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading || timer <= 0}
                className="w-full py-3 bg-[#dfceb3] hover:bg-[#d4c1a3] text-[#0b2034] font-extrabold rounded-xl text-center shadow-lg disabled:opacity-50 transition text-sm"
              >
                {loading ? (isRtl ? 'جاري التحقق...' : 'Verifying...') : (isRtl ? 'تحقق / Verify' : 'Verify / تحقق')}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="text-xs text-[#dfceb3] hover:text-white font-bold hover:underline disabled:opacity-40 transition"
                >
                  {cooldown > 0
                    ? `${isRtl ? 'إعادة إرسال بعد' : 'Resend in'} ${cooldown}s`
                    : isRtl
                    ? 'إعادة إرسال الرمز'
                    : 'Resend Verification Code'}
                </button>
              </div>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="border-t border-[#dfceb3]/10 pt-4 text-center">
            <Link
              to="/login"
              className="text-xs text-[#dfceb3] hover:text-white font-bold transition flex items-center justify-center gap-1"
            >
              <ArrowLeft className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              {isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Link>
          </div>
        </div>

        {/* Right Side: Sand Beige Gold Panel matching uploaded image */}
        <div className="hidden md:flex w-[55%] relative overflow-hidden bg-[#dfceb3] text-[#0b2034] p-10 flex-col items-center justify-center text-center">
          <div className="survey-grid-bg absolute inset-0 opacity-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <DmcLogo className="scale-150 transform text-[#0b2034] mb-4" />
            <div className="h-1 w-16 bg-[#0b2034] rounded-full my-2" />
            <h3 className="text-xl font-black tracking-tight text-[#0b2034]">
              {isRtl ? 'منظومة الأمان والتحقق المزدوج' : 'Multi-Factor Security System'}
            </h3>
            <p className="text-xs font-semibold text-[#0b2034]/80 max-w-sm leading-relaxed">
              {isRtl
                ? 'دار مكة للاستشارات الهندسية — حماية بيانات المشاريع المساحية والمعاملات بتسجيل دخول آمن.'
                : 'Dar Makkah Engineering Consultancy — Secure multi-factor authentication for surveying projects.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------- MASTER LOG SHEET FOR ALL PROJECTS -----------------
export function MasterLogPage(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectDetailsMap, setProjectDetailsMap] = useState<Record<string, ProjectDetailsJson>>({});
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | undefined>(undefined);
  const [editWorkType, setEditWorkType] = useState('SURVEY_TRANSFER');

  const loadProjects = async () => {
    try {
      const [data, clientData] = await Promise.all([
        window.api.localDb.getProjects(),
        window.api.localDb.getClients(),
      ]);
      const clientLookup: Record<string, string> = {};
      (clientData as ClientItem[]).forEach((c) => {
        clientLookup[c.id] = c.name;
      });
      const enriched = (data as ProjectItem[]).map((p) => ({
        ...p,
        clientName: p.clientName || clientLookup[p.clientId] || '',
      }));

      const detailsMap: Record<string, ProjectDetailsJson> = {};
      await Promise.all(
        enriched.map(async (p) => {
          const det = (await window.api.localDb.getProjectDetails(p.id)) as { detailsJson?: ProjectDetailsJson } | null;
          if (det && det.detailsJson) {
            detailsMap[p.id] = det.detailsJson;
          }
        })
      );

      setProjects(enriched);
      setProjectDetailsMap(detailsMap);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get dynamic unique list of creators
  const creators = Array.from(
    new Set(projects.map((p) => p.createdBy).filter(Boolean))
  ) as string[];

  // Filtered projects
  const filteredProjects = projects.filter((project) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = project.projectName?.toLowerCase().includes(query);
      const clientMatch = project.clientName?.toLowerCase().includes(query);
      const numberMatch = project.projectNumber?.toLowerCase().includes(query);
      if (!nameMatch && !clientMatch && !numberMatch) return false;
    }

    if (workTypeFilter && project.workType !== workTypeFilter) return false;
    if (statusFilter && project.status !== statusFilter) return false;
    if (creatorFilter && project.createdBy !== creatorFilter) return false;

    if (project.createdAt) {
      const projDate = new Date(project.createdAt).getTime();
      if (startDate && projDate < new Date(startDate).getTime()) return false;
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        if (projDate > endDateTime.getTime()) return false;
      }
    }

    return true;
  });

  const totalCount = filteredProjects.length;
  const totalValue = filteredProjects.reduce((acc, p) => {
    const meta = projectDetailsMap[p.id]?.metadata || {};
    const val = parseFloat(meta.contractValue || meta.grandTotal || meta.totalPrice || '0') || 0;
    return acc + val;
  }, 0);

  const totalPaid = filteredProjects.reduce((acc, p) => {
    const meta = projectDetailsMap[p.id]?.metadata || {};
    const val = parseFloat(meta.paidAmount || '0') || 0;
    return acc + val;
  }, 0);

  const totalRemaining = filteredProjects.reduce((acc, p) => {
    const meta = projectDetailsMap[p.id]?.metadata || {};
    const rem = parseFloat(meta.remainingAmount || '0');
    if (!isNaN(rem) && meta.remainingAmount !== undefined) return acc + rem;
    const tot = parseFloat(meta.contractValue || meta.grandTotal || meta.totalPrice || '0') || 0;
    const pd = parseFloat(meta.paidAmount || '0') || 0;
    return acc + Math.max(0, tot - pd);
  }, 0);

  const overallPaidPct = totalValue > 0 ? ((totalPaid / totalValue) * 100).toFixed(1) : '0';

  const handleExportCSV = () => {
    const headers = isRtl
      ? ['رقم المشروع', 'اسم المشروع', 'العميل', 'نوع العمل', 'قيمة الأتعاب (ر.س)', 'المبلغ المدفوع (ر.س)', 'نسبة السداد (%)', 'المبلغ المتبقي (ر.س)', 'الحالة', 'التقدم', 'أنشئ بواسطة', 'تاريخ الإنشاء']
      : ['Project Ref', 'Project Name', 'Client Name', 'Work Type', 'Fee Amount (SAR)', 'Paid Amount (SAR)', 'Payment Percentage (%)', 'Remaining Amount (SAR)', 'Status', 'Progress', 'Created By', 'Created Date'];

    const rows = filteredProjects.map((p) => {
      const meta = projectDetailsMap[p.id]?.metadata || {};
      const totVal = parseFloat(meta.contractValue || meta.grandTotal || meta.totalPrice || '0') || 0;
      const paidVal = parseFloat(meta.paidAmount || '0') || 0;
      const remVal = parseFloat(meta.remainingAmount || String(Math.max(0, totVal - paidVal))) || 0;
      const pctPaid = meta.paymentPercentage || (totVal > 0 ? ((paidVal / totVal) * 100).toFixed(1) : '0');

      return [
        p.projectNumber,
        p.projectName || '',
        p.clientName || '',
        t(`nav.${p.workType === 'BALADI_TRANSACTION' ? 'baladiTransactions' : p.workType === 'SURVEY_DECISION' ? 'surveyDecision' : p.workType === 'PRICE_OFFERS' ? 'priceOffers' : p.workType === 'SURVEY_TRANSFER' ? 'surveyTransfer' : p.workType === 'SURVEY_SKETCH' ? 'surveySketch' : p.workType === 'CONTRACTS' ? 'contracts' : 'reports'}`),
        totVal.toFixed(2),
        paidVal.toFixed(2),
        `${pctPaid}%`,
        remVal.toFixed(2),
        t(`status.${p.status === 'UNDER_PROCEDURE' ? 'underProcedure' : p.status === 'IN_PROGRESS' ? 'inProgress' : p.status === 'COMPLETED' ? 'completed' : 'pending'}`),
        `${p.progress}%`,
        p.createdBy || '',
        new Date(p.createdAt).toLocaleDateString(i18n.language),
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Master_Log_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const [deleteProjectTarget, setDeleteProjectTarget] = useState<ProjectItem | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const handleDeleteProject = async () => {
    if (!deleteProjectTarget) return;
    setIsDeletingProject(true);
    try {
      await window.api.localDb.deleteProject(deleteProjectTarget.id, true);
      setDeleteProjectTarget(null);
      loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingProject(false);
    }
  };

  return (
    <PlaceholderWrapper title={isRtl ? 'سجل المعاملات العام' : 'Master Log Sheet'} icon={ClipboardList}>
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
          <div>
            <h3 className="text-lg font-bold">{isRtl ? 'سجل المعاملات العام للمشاريع' : 'All Projects Master Log Sheet'}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl ? 'عرض وتصفية وتصدير كافة مشاريع ومعاملات المكتب المساحي والبيانات المالية' : 'View, filter, and export all surveying office transactions and financial tracking'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-lg border border-border transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isRtl ? 'تصدير CSV (Excel)' : 'Export CSV (Excel)'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-lg border border-border transition-all shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isRtl ? 'طباعة التقرير' : 'Print Log'}</span>
            </button>
          </div>
        </div>

        {/* Financial & Summary Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المعاملات' : 'Total Transactions'}</span>
            <div className="text-2xl font-black text-foreground">{totalCount}</div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي قيمة الأتعاب (ر.س)' : 'Total Fee Amount (SAR)'}</span>
            <div className="text-2xl font-black text-primary font-mono">
              {totalValue.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المحصل / المدفوع' : 'Total Paid (SAR)'}</span>
              <span className="text-[10px] font-extrabold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">{overallPaidPct}%</span>
            </div>
            <div className="text-2xl font-black text-green-600 dark:text-green-400 font-mono">
              {totalPaid.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المتبقي (ر.س)' : 'Total Remaining (SAR)'}</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {totalRemaining.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">{isRtl ? 'البحث عن مشروع' : 'Search Projects'}</label>
              <div className="relative">
                <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isRtl ? 'رقم المشروع، الاسم، العميل...' : 'Ref #, name, client...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ps-8 pe-3 py-1.5 border border-border rounded-lg bg-background text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">{isRtl ? 'نوع المعاملة' : 'Work Type'}</label>
              <select
                value={workTypeFilter}
                onChange={(e) => setWorkTypeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
              >
                <option value="">{isRtl ? 'الكل' : 'All Work Types'}</option>
                <option value="SURVEY_TRANSFER">{t('nav.surveyTransfer')}</option>
                <option value="REPORTS">{t('nav.reports')}</option>
                <option value="SURVEY_SKETCH">{t('nav.surveySketch')}</option>
                <option value="BALADI_TRANSACTION">{t('nav.baladiTransactions')}</option>
                <option value="SURVEY_DECISION">{t('nav.surveyDecision')}</option>
                <option value="PRICE_OFFERS">{t('nav.priceOffers')}</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">{isRtl ? 'حالة المشروع' : 'Status'}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
              >
                <option value="">{isRtl ? 'الكل' : 'All Statuses'}</option>
                <option value="PENDING">{t('status.pending')}</option>
                <option value="UNDER_PROCEDURE">{t('status.underProcedure')}</option>
                <option value="IN_PROGRESS">{t('status.inProgress')}</option>
                <option value="COMPLETED">{t('status.completed')}</option>
              </select>
            </div>

            {/* Creator */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">{isRtl ? 'أنشئ بواسطة' : 'Created By'}</label>
              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
              >
                <option value="">{isRtl ? 'الكل' : 'All Users'}</option>
                {creators.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">{isRtl ? 'من تاريخ' : 'Start Date'}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">{isRtl ? 'إلى تاريخ' : 'End Date'}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
              />
            </div>
            
          </div>
        </div>

        {/* Table/Sheet View */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="border border-border border-dashed p-12 text-center rounded-xl bg-card shadow-sm flex flex-col items-center justify-center space-y-3">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
            <h4 className="font-bold text-md text-foreground">{t('common.noProjects')}</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {isRtl ? 'لا توجد مشاريع مسجلة حالياً تطابق معايير التصفية.' : 'No projects matched the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-start text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider text-start">
                  <th className="px-4 py-3 text-start">{isRtl ? 'رقم المشروع' : 'Project Ref'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'اسم المشروع' : 'Project Name'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'العميل' : 'Client'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'نوع المعاملة' : 'Work Type'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'قيمة العمل' : 'Total Amount'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'المدفوع (%)' : 'Paid (%)'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'المتبقي' : 'Remaining'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'التقدم' : 'Progress'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'أنشئ بواسطة' : 'Created By'}</th>
                  <th className="px-4 py-3 text-start print:hidden">{isRtl ? 'الخيارات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((project) => {
                  const meta = projectDetailsMap[project.id]?.metadata || {};
                  const totVal = parseFloat(meta.contractValue || meta.grandTotal || meta.totalPrice || '0') || 0;
                  const paidVal = parseFloat(meta.paidAmount || '0') || 0;
                  const remVal = parseFloat(meta.remainingAmount || String(Math.max(0, totVal - paidVal))) || 0;
                  const pctPaid = meta.paymentPercentage || (totVal > 0 ? ((paidVal / totVal) * 100).toFixed(1) : '0');

                  return (
                    <tr key={project.id} className="hover:bg-muted/5 transition-all">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                        <Link to={`/project/${project.id}`} className="hover:underline">
                          {project.projectNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground truncate max-w-[160px]" title={project.projectName}>
                        {project.projectName || 'Project / مشروع'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{project.clientName}</span>
                          {project.clientPhone && (
                            <span className="text-[10px] text-muted-foreground font-mono">{project.clientPhone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {project.workType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-xs text-foreground">
                        {totVal > 0 ? `${totVal.toLocaleString(i18n.language)} ر.س` : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-xs text-green-600 dark:text-green-400">
                        {paidVal > 0 ? (
                          <div className="flex items-center gap-1">
                            <span>{paidVal.toLocaleString(i18n.language)} ر.س</span>
                            <span className="text-[9px] bg-green-500/10 px-1 py-0.2 rounded">({pctPaid}%)</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs font-normal">0.00</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-xs text-amber-600 dark:text-amber-400">
                        {remVal > 0 ? `${remVal.toLocaleString(i18n.language)} ر.س` : <span className="text-green-600 text-xs font-sans">خالص</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          project.status === 'COMPLETED'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : project.status === 'PENDING'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-primary/10 text-primary'
                        }`}>
                          {t(`status.${project.status === 'UNDER_PROCEDURE' ? 'underProcedure' : project.status === 'IN_PROGRESS' ? 'inProgress' : project.status === 'COMPLETED' ? 'completed' : 'pending'}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${getProgressColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold font-mono">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {project.createdBy || <span className="italic opacity-60">—</span>}
                      </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {new Date(project.createdAt).toLocaleDateString(i18n.language)}
                    </td>
                    <td className="px-4 py-3 print:hidden">
                      <div className="flex gap-1.5">
                        <Link
                          to={`/project/${project.id}`}
                          className="p-1 bg-secondary text-secondary-foreground border border-border rounded hover:bg-accent transition-all text-xs"
                          title={isRtl ? 'عرض التفاصيل' : 'View Details'}
                        >
                          👁
                        </Link>
                        <button
                          onClick={() => {
                            setEditProjectId(project.id);
                            setEditWorkType(project.workType);
                            setEditOpen(true);
                          }}
                          className="p-1 bg-secondary text-secondary-foreground border border-border rounded hover:bg-accent transition-all text-xs"
                          title={isRtl ? 'تعديل المشروع' : 'Edit Project'}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 bg-destructive/10 text-destructive border border-destructive/20 rounded hover:bg-destructive/20 transition-all text-xs"
                          title={isRtl ? 'حذف المشروع' : 'Delete Project'}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {editOpen && (
        <ProjectFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          isEdit={true}
          editProjectId={editProjectId}
          workTypeArg={editWorkType}
          onSuccess={loadProjects}
        />
      )}
    </PlaceholderWrapper>
  );
}

// ----------------- 14. CONTRACTS MANAGEMENT SECTION -----------------
export function ContractsPage(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [contracts, setContracts] = useState<ProjectItem[]>([]);
  const [contractDetailsMap, setContractDetailsMap] = useState<Record<string, ProjectDetailsJson>>({});
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | undefined>(undefined);

  const loadContracts = async () => {
    try {
      const [data, clientData] = await Promise.all([
        window.api.localDb.getProjects(),
        window.api.localDb.getClients(),
      ]);
      const clientLookup: Record<string, string> = {};
      (clientData as ClientItem[]).forEach((c) => {
        clientLookup[c.id] = c.name;
      });

      const filtered = (data as ProjectItem[]).filter((p) => p.workType === 'CONTRACTS');
      const enriched = filtered.map((p) => ({
        ...p,
        clientName: p.clientName || clientLookup[p.clientId] || '',
      }));

      const detailsMap: Record<string, ProjectDetailsJson> = {};
      await Promise.all(
        enriched.map(async (p) => {
          const det = (await window.api.localDb.getProjectDetails(p.id)) as { detailsJson?: ProjectDetailsJson } | null;
          if (det && det.detailsJson) {
            detailsMap[p.id] = det.detailsJson;
          }
        })
      );

      setContracts(enriched);
      setContractDetailsMap(detailsMap);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
    const interval = setInterval(loadContracts, 5000);
    return () => clearInterval(interval);
  }, []);

  const [deleteContractTarget, setDeleteContractTarget] = useState<ProjectItem | null>(null);
  const [isDeletingContract, setIsDeletingContract] = useState(false);

  const handleDeleteContract = async () => {
    if (!deleteContractTarget) return;
    setIsDeletingContract(true);
    try {
      await window.api.localDb.deleteProject(deleteContractTarget.id, true);
      setDeleteContractTarget(null);
      loadContracts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingContract(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    const meta = contractDetailsMap[c.id]?.metadata || {};
    const matchesSearch =
      !query ||
      c.projectNumber.toLowerCase().includes(query) ||
      (c.projectName && c.projectName.toLowerCase().includes(query)) ||
      c.clientName.toLowerCase().includes(query) ||
      (meta.contractNumber && meta.contractNumber.toLowerCase().includes(query));

    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = contracts.length;
  const activeCount = contracts.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'UNDER_PROCEDURE').length;
  
  const totalValue = contracts.reduce((acc, c) => {
    const val = parseFloat(contractDetailsMap[c.id]?.metadata?.contractValue || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const totalPaid = contracts.reduce((acc, c) => {
    const val = parseFloat(contractDetailsMap[c.id]?.metadata?.paidAmount || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const totalRemaining = contracts.reduce((acc, c) => {
    const val = parseFloat(contractDetailsMap[c.id]?.metadata?.remainingAmount || '0');
    if (!isNaN(val)) return acc + val;
    const tot = parseFloat(contractDetailsMap[c.id]?.metadata?.contractValue || '0') || 0;
    const pd = parseFloat(contractDetailsMap[c.id]?.metadata?.paidAmount || '0') || 0;
    return acc + Math.max(0, tot - pd);
  }, 0);

  const overallPaidPct = totalValue > 0 ? ((totalPaid / totalValue) * 100).toFixed(1) : '0';

  return (
    <PlaceholderWrapper title={t('nav.contracts')} icon={FileSignature} currentWorkType="CONTRACTS">
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">{isRtl ? 'إدارة عقود الخدمات المساحية' : 'Surveying Contracts Management'}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isRtl ? 'متابعة وتوثيق العقود، الدفعات المسددة، المبالغ المتبقية، ونسب الإنجاز.' : 'Track client surveying contracts, paid installments, remaining dues, and progress.'}
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-extrabold rounded-xl hover:bg-primary/95 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{isRtl ? 'إضافة عقد جديد' : 'Add New Contract'}</span>
          </button>
        </div>

        {/* Financial & Stats Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي العقود' : 'Total Contracts'}</span>
            <div className="text-2xl font-black text-foreground">{totalCount} ({activeCount} {isRtl ? 'نشط' : 'active'})</div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي قيمة العقود (ر.س)' : 'Total Contract Value (SAR)'}</span>
            <div className="text-2xl font-black text-primary font-mono">
              {totalValue.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المدفوع (ر.س)' : 'Total Paid (SAR)'}</span>
              <span className="text-[10px] font-extrabold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">{overallPaidPct}%</span>
            </div>
            <div className="text-2xl font-black text-green-600 dark:text-green-400 font-mono">
              {totalPaid.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي المتبقي (ر.س)' : 'Total Remaining (SAR)'}</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {totalRemaining.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
            <input
              type="text"
              placeholder={isRtl ? 'البحث برقم العقد، العميل، أو اسم الخدمة...' : 'Search by contract ref, client, or title...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none`}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-xs font-semibold focus:outline-none"
            >
              <option value="">{t('common.allStatuses')}</option>
              <option value="PENDING">{t('status.pending')}</option>
              <option value="UNDER_PROCEDURE">{t('status.underProcedure')}</option>
              <option value="IN_PROGRESS">{t('status.inProgress')}</option>
              <option value="COMPLETED">{t('status.completed')}</option>
            </select>
          </div>
        </div>

        {/* Contracts Financial Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="border border-border border-dashed p-12 text-center rounded-xl bg-card shadow-sm flex flex-col items-center justify-center space-y-3">
            <FileSignature className="h-12 w-12 text-muted-foreground" />
            <h4 className="font-bold text-md text-foreground">{isRtl ? 'لا توجد عقود مسجلة' : 'No contracts found'}</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {isRtl ? 'لم يتم العثور على أي عقود مطابقة لمعايير البحث.' : 'No contract records match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-start text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider text-start">
                  <th className="px-4 py-3 text-start">{isRtl ? 'رقم العقد' : 'Contract Ref'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'عنوان الخدمة / العقد' : 'Contract Title'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'العميل' : 'Client'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'قيمة العقد' : 'Total Amount'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'المدفوع (%)' : 'Paid (%)'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'المتبقي' : 'Remaining'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-start">{isRtl ? 'التقدم' : 'Progress'}</th>
                  <th className="px-4 py-3 text-start print:hidden">{isRtl ? 'الخيارات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContracts.map((contract) => {
                  const meta = contractDetailsMap[contract.id]?.metadata || {};
                  const totVal = parseFloat(meta.contractValue || '0') || 0;
                  const paidVal = parseFloat(meta.paidAmount || '0') || 0;
                  const remVal = parseFloat(meta.remainingAmount || String(Math.max(0, totVal - paidVal))) || 0;
                  const pctPaid = meta.paymentPercentage || (totVal > 0 ? ((paidVal / totVal) * 100).toFixed(1) : '0');

                  return (
                    <tr key={contract.id} className="hover:bg-muted/5 transition-all">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                        <Link to={`/project/${contract.id}`} className="hover:underline">
                          {contract.projectNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground truncate max-w-[180px]" title={contract.projectName}>
                        {contract.projectName || (isRtl ? 'عقد تقديم خدمات مساحية' : 'Surveying Services Contract')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{contract.clientName}</span>
                          {contract.clientPhone && (
                            <span className="text-[10px] text-muted-foreground font-mono">{contract.clientPhone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-xs text-foreground">
                        {totVal > 0 ? `${totVal.toLocaleString(i18n.language)} ر.س` : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-xs text-green-600 dark:text-green-400">
                        {paidVal > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span>{paidVal.toLocaleString(i18n.language)} ر.س</span>
                            <span className="text-[10px] bg-green-500/10 px-1 py-0.2 rounded">({pctPaid}%)</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs font-normal">0.00 (0%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-xs text-amber-600 dark:text-amber-400">
                        {remVal > 0 ? `${remVal.toLocaleString(i18n.language)} ر.س` : <span className="text-green-600 text-xs">مسدد بالكامل</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          contract.status === 'COMPLETED'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : contract.status === 'PENDING'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-primary/10 text-primary'
                        }`}>
                          {t(`status.${contract.status === 'UNDER_PROCEDURE' ? 'underProcedure' : contract.status === 'IN_PROGRESS' ? 'inProgress' : contract.status === 'COMPLETED' ? 'completed' : 'pending'}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${getProgressColor(contract.progress)}`}
                              style={{ width: `${contract.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold font-mono">{contract.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 print:hidden">
                        <div className="flex gap-1.5">
                          <Link
                            to={`/project/${contract.id}`}
                            className="p-1 bg-secondary text-secondary-foreground border border-border rounded hover:bg-accent transition-all text-xs"
                            title={isRtl ? 'عرض التفاصيل' : 'View Details'}
                          >
                            👁
                          </Link>
                          <button
                            onClick={() => {
                              setEditProjectId(contract.id);
                              setEditOpen(true);
                            }}
                            className="p-1 bg-secondary text-secondary-foreground border border-border rounded hover:bg-accent transition-all text-xs"
                            title={isRtl ? 'تعديل العقد' : 'Edit Contract'}
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteContract(contract.id)}
                            className="p-1 bg-destructive/10 text-destructive border border-destructive/20 rounded hover:bg-destructive/20 transition-all text-xs"
                            title={isRtl ? 'حذف العقد' : 'Delete Contract'}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {addOpen && (
        <ProjectFormModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          isEdit={false}
          workTypeArg="CONTRACTS"
          onSuccess={loadContracts}
        />
      )}

      {editOpen && (
        <ProjectFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          isEdit={true}
          editProjectId={editProjectId}
          workTypeArg="CONTRACTS"
          onSuccess={loadContracts}
        />
      )}
    </PlaceholderWrapper>
  );
}
