import React, { useState, useCallback } from 'react';
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ToggleRight,
  ToggleLeft,
  Clock,
  Zap,
  ShieldCheck,
  Info,
  CheckCheck,
  KeyRound
} from 'lucide-react';
import { auth } from '../../services/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmailSettings {
  activeProvider: string;                   // "emailjs" | "firebase"
  emailjsEnabled: boolean;                  // EmailJS configured / available
  customEmailEnabled: boolean;              // Password reset toggle
  customVerificationEmailEnabled: boolean;  // Verification email toggle
  lastFailureReason?: string;
  lastUpdated?: string;                     // ISO string or human-readable
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';
type ActionType = 'reset-enable' | 'reset-disable' | 'verify-enable' | 'verify-disable' | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = 'https://kcet-password-reset.vercel.app/api/admin/email-settings';

// ─── Helper: get Firebase ID token safely ────────────────────────────────────

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated. Please sign in first.');
  if (!user.emailVerified) throw new Error('Email not verified. Please verify your email.');
  return user.getIdToken(/* forceRefresh */ false);
}

// ─── Component ───────────────────────────────────────────────────────────────

export const EmailDeliveryTab: React.FC = () => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [fetchError, setFetchError] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // ── Fetch current settings ────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    setActionError('');
    setActionSuccess('');
    try {
      const token = await getIdToken();
      const res = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Access denied. You are not authorised as an admin.');
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      setSettings({
        activeProvider:                 data.activeProvider ?? (data.customEmailEnabled ? 'emailjs' : 'firebase'),
        emailjsEnabled:                 data.emailjsEnabled ?? data.emailjsConfigured ?? false,
        customEmailEnabled:             data.customEmailEnabled === true,
        customVerificationEmailEnabled: data.customVerificationEmailEnabled === true,
        lastFailureReason:              data.lastFailureReason ?? data.lastError ?? '',
        lastUpdated:                    data.lastUpdated ?? data.updatedAt ?? '',
      });
      setFetchState('success');
    } catch (err: unknown) {
      setFetchState('error');
      setFetchError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, []);

  // ── Toggle Password Reset EmailJS ─────────────────────────────────────────

  const togglePasswordReset = async (enable: boolean) => {
    if (activeAction !== null) return;
    setActiveAction(enable ? 'reset-enable' : 'reset-disable');
    setActionError('');
    setActionSuccess('');
    try {
      const token = await getIdToken();
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customEmailEnabled: enable }),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Access denied. You are not authorised as an admin.');
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server error (${res.status})`);
      }

      setActionSuccess(
        enable
          ? '✅ Custom Password Reset via EmailJS enabled successfully.'
          : '✅ Custom Password Reset disabled. Password resets will use Firebase Auth.'
      );

      await fetchSettings();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setActiveAction(null);
    }
  };

  // ── Toggle Verification EmailJS ───────────────────────────────────────────

  const toggleVerification = async (enable: boolean) => {
    if (activeAction !== null) return;
    setActiveAction(enable ? 'verify-enable' : 'verify-disable');
    setActionError('');
    setActionSuccess('');
    try {
      const token = await getIdToken();
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customVerificationEmailEnabled: enable }),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Access denied. You are not authorised as an admin.');
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server error (${res.status})`);
      }

      setActionSuccess(
        enable
          ? '✅ Custom Email Verification via EmailJS enabled successfully.'
          : '✅ Custom Email Verification disabled. Verifications will use Firebase Auth.'
      );

      await fetchSettings();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setActiveAction(null);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────

  const isResetActive   = settings?.customEmailEnabled === true;
  const isVerifyActive  = settings?.customVerificationEmailEnabled === true;
  const providerLabel   = settings?.activeProvider
    ? settings.activeProvider.charAt(0).toUpperCase() + settings.activeProvider.slice(1)
    : '—';

  const formattedDate = settings?.lastUpdated
    ? (() => {
        try {
          return new Date(settings.lastUpdated).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
        } catch {
          return settings.lastUpdated;
        }
      })()
    : null;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <Mail className="w-5 h-5 text-admin-primary" />
            Email Delivery Settings
          </h2>
          <p className="text-sm text-admin-muted mt-0.5">
            Configure custom branded password-reset and email-verification delivery for KCET GenZ students.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={fetchState === 'loading'}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-primary hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow transition-all active:scale-95"
        >
          {fetchState === 'loading'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <RefreshCw className="w-4 h-4" />}
          {fetchState === 'loading' ? 'Refreshing…' : fetchState === 'idle' ? 'Load Settings' : 'Refresh Status'}
        </button>
      </div>

      {/* ── Idle Prompt ─────────────────────────────────────────────────── */}
      {fetchState === 'idle' && (
        <div className="bg-white rounded-card border border-admin-cardBorder shadow-sm p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <Mail className="w-7 h-7 text-admin-primary" />
          </div>
          <p className="text-admin-heading font-semibold">Email Delivery Settings</p>
          <p className="text-sm text-admin-muted max-w-sm">
            Click <strong>"Load Settings"</strong> above to fetch the current live email provider configuration.
          </p>
        </div>
      )}

      {/* ── Loading skeleton ────────────────────────────────────────────── */}
      {fetchState === 'loading' && (
        <div className="bg-white rounded-card border border-admin-cardBorder shadow-sm p-8 flex items-center justify-center gap-3 text-admin-muted">
          <Loader2 className="w-6 h-6 animate-spin text-admin-primary" />
          <span className="text-sm font-medium">Fetching email settings…</span>
        </div>
      )}

      {/* ── Fetch Error ─────────────────────────────────────────────────── */}
      {fetchState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-card p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Failed to load settings</p>
            <p className="text-red-600 text-sm mt-0.5">{fetchError}</p>
            <button
              onClick={fetchSettings}
              className="mt-3 text-sm font-bold text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Main Settings Cards ─────────────────────────────────────────── */}
      {fetchState === 'success' && settings && (
        <>
          {/* Status Overview Card */}
          <div className="bg-white rounded-card border border-admin-cardBorder shadow-sm p-6 space-y-5">
            <h3 className="text-base font-bold text-admin-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-admin-primary" />
              Current Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Active Provider */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-admin-muted uppercase tracking-wide mb-1.5">Active Provider</p>
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${isResetActive || isVerifyActive ? 'text-amber-500' : 'text-blue-500'}`} />
                  <span className="text-sm font-bold text-admin-heading">{providerLabel}</span>
                </div>
              </div>

              {/* EmailJS Configuration Status */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-admin-muted uppercase tracking-wide mb-1.5">EmailJS Configured</p>
                <div className="flex items-center gap-2">
                  {settings.emailjsEnabled
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className={`text-sm font-bold ${settings.emailjsEnabled ? 'text-emerald-700' : 'text-red-600'}`}>
                    {settings.emailjsEnabled ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
              </div>

              {/* Password Reset Custom Status */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-admin-muted uppercase tracking-wide mb-1.5">Password Reset Email</p>
                <div className="flex items-center gap-2">
                  {isResetActive
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" /> EMAILJS
                      </span>
                    : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                        <XCircle className="w-3 h-3" /> FIREBASE
                      </span>}
                </div>
              </div>

              {/* Email Verification Custom Status */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-admin-muted uppercase tracking-wide mb-1.5">Email Verification</p>
                <div className="flex items-center gap-2">
                  {isVerifyActive
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" /> EMAILJS
                      </span>
                    : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                        <XCircle className="w-3 h-3" /> FIREBASE
                      </span>}
                </div>
              </div>

              {/* Last Failure Reason */}
              {settings.lastFailureReason && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">Last Failure Reason</p>
                  <p className="text-sm text-amber-800 font-medium break-words">{settings.lastFailureReason}</p>
                </div>
              )}

              {/* Last Updated */}
              {formattedDate && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-admin-muted uppercase tracking-wide mb-1.5">Last Updated</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-admin-muted" />
                    <span className="text-sm text-admin-heading font-medium">{formattedDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Success Banner */}
          {actionSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-card p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-emerald-700">{actionSuccess}</p>
            </div>
          )}

          {/* Action Error Banner */}
          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-card p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Action failed</p>
                <p className="text-sm text-red-600 mt-0.5">{actionError}</p>
              </div>
            </div>
          )}

          {/* ── Independent Toggle Cards Grid ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. Password Reset Control Card */}
            <div className="bg-white rounded-card border border-admin-cardBorder shadow-sm p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-admin-heading flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    Custom Password Reset Email
                  </h3>
                  {isResetActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3" /> ENABLED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                      <XCircle className="w-3 h-3" /> DISABLED
                    </span>
                  )}
                </div>
                <p className="text-sm text-admin-muted">
                  Sends custom KCET GenZ branded password reset emails via EmailJS with your custom template and reset URL.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => togglePasswordReset(true)}
                  disabled={activeAction !== null || isResetActive}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button font-bold text-sm transition-all active:scale-95 shadow-sm ${
                    isResetActive
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 cursor-not-allowed opacity-80'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {activeAction === 'reset-enable'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ToggleRight className="w-4 h-4" />}
                  {activeAction === 'reset-enable' ? 'Enabling…' : isResetActive ? '✓ EmailJS Enabled' : 'Enable EmailJS Reset'}
                </button>

                <button
                  onClick={() => togglePasswordReset(false)}
                  disabled={activeAction !== null || !isResetActive}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button font-bold text-sm transition-all active:scale-95 shadow-sm ${
                    !isResetActive
                      ? 'bg-slate-100 text-slate-500 border-2 border-slate-200 cursor-not-allowed opacity-80'
                      : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {activeAction === 'reset-disable'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ToggleLeft className="w-4 h-4" />}
                  {activeAction === 'reset-disable' ? 'Disabling…' : !isResetActive ? '✓ Firebase Default' : 'Disable (Use Firebase)'}
                </button>
              </div>
            </div>

            {/* 2. Email Verification Control Card */}
            <div className="bg-white rounded-card border border-admin-cardBorder shadow-sm p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-admin-heading flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    Custom Email Verification
                  </h3>
                  {isVerifyActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3" /> ENABLED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                      <XCircle className="w-3 h-3" /> DISABLED
                    </span>
                  )}
                </div>
                <p className="text-sm text-admin-muted">
                  Sends custom KCET GenZ branded account verification emails via EmailJS using template <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">template_b8prbsf</code>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => toggleVerification(true)}
                  disabled={activeAction !== null || isVerifyActive}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button font-bold text-sm transition-all active:scale-95 shadow-sm ${
                    isVerifyActive
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 cursor-not-allowed opacity-80'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {activeAction === 'verify-enable'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ToggleRight className="w-4 h-4" />}
                  {activeAction === 'verify-enable' ? 'Enabling…' : isVerifyActive ? '✓ EmailJS Enabled' : 'Enable EmailJS Verification'}
                </button>

                <button
                  onClick={() => toggleVerification(false)}
                  disabled={activeAction !== null || !isVerifyActive}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button font-bold text-sm transition-all active:scale-95 shadow-sm ${
                    !isVerifyActive
                      ? 'bg-slate-100 text-slate-500 border-2 border-slate-200 cursor-not-allowed opacity-80'
                      : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {activeAction === 'verify-disable'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ToggleLeft className="w-4 h-4" />}
                  {activeAction === 'verify-disable' ? 'Disabling…' : !isVerifyActive ? '✓ Firebase Default' : 'Disable (Use Firebase)'}
                </button>
              </div>
            </div>

          </div>

          {/* Explanation Info */}
          <div className="p-4 bg-indigo-50 rounded-card border border-indigo-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-700 space-y-1">
              <p>
                <strong>Independent Delivery:</strong> Password reset and email verification operate completely independently. You can enable EmailJS for either or both services.
              </p>
              <p>
                <strong>Automatic Fallback:</strong> If an EmailJS service or template is disabled, the Android app safely defaults to Firebase Authentication's native delivery.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-slate-50 rounded-card border border-slate-200 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-admin-muted shrink-0 mt-0.5" />
            <p className="text-xs text-admin-muted leading-relaxed">
              All requests are authenticated with your Firebase ID token and verified server-side.
              Credentials (EmailJS private key, service-account JSON, rate-limit secret) remain strictly in server environment variables and are never exposed to clients or source control.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
