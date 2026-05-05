import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VaultEntry } from '../types';
import { useLang } from '../LangContext';

interface Props {
  onClose: () => void;
  isWindow?: boolean;
}

function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const types = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  if (password.length < 8 || types <= 1) return 'weak';
  if (password.length >= 12 && types >= 3) return 'strong';
  return 'medium';
}

const strengthLabelKey = {
  weak: 'vaultPwWeak' as const,
  medium: 'vaultPwMedium' as const,
  strong: 'vaultPwStrong' as const,
};

function getLastUsedText(entryId: string, t: (key: any) => string): string | null {
  try {
    const data = JSON.parse(localStorage.getItem('noteit-vault-lastused') || '{}');
    const dateStr = data[entryId];
    if (!dateStr) return null;
    const lastUsed = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - lastUsed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('vaultUsedToday');
    if (diffDays === 1) return t('vaultUsedYesterday');
    return `${t('vaultUsed')} ${diffDays} ${t('vaultUsedDaysAgo')}`;
  } catch {
    return null;
  }
}

function getDaysSinceUpdate(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

type VaultView = 'loading' | 'create' | 'unlock' | 'entries';
type CategoryFilter = 'all' | string;

const DEFAULT_CATEGORIES = ['social', 'email', 'banking', 'work', 'shopping', 'other', 'archive'];
const CLIPBOARD_CLEAR_MS = 30 * 1000; // 30 seconds

const LOCK_TIMEOUT_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
  { value: 360, label: '6h' },
  { value: 720, label: '12h' },
];

const categoryColors: Record<string, string> = {
  social: '#6366f1',
  email: '#ef4444',
  banking: '#10b981',
  work: '#f59e0b',
  shopping: '#ec4899',
  archive: '#9ca3af',
  other: '#8b5cf6',
};

export default function PasswordVault({ onClose, isWindow = false }: Props) {
  const { t } = useLang();
  const [vaultView, setVaultView] = useState<VaultView>('loading');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortMode, setSortMode] = useState<'name' | 'category' | 'recent'>(() => {
    const saved = localStorage.getItem('noteit-vault-sort');
    return (saved as 'name' | 'category' | 'recent') || 'recent';
  });
  const [editEntry, setEditEntry] = useState<VaultEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entry: VaultEntry } | null>(null);
  const [showLockSettings, setShowLockSettings] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);

  // Unlock/Create form state
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [keyFilePath, setKeyFilePath] = useState<string | null>(null);
  const [vaultFilePath, setVaultFilePath] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Entry form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCategory, setFormCategory] = useState('other');
  const [customCategory, setCustomCategory] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formPasswordConfirm, setFormPasswordConfirm] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Generator state
  const [genLength, setGenLength] = useState(16);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genDigits, setGenDigits] = useState(true);
  const [genSpecial, setGenSpecial] = useState(true);
  const [genResult, setGenResult] = useState('');

  // Auto-lock
  const [lockTimeout, setLockTimeout] = useState(() => {
    const saved = localStorage.getItem('noteit-vault-lock-timeout');
    return saved ? Number(saved) : 5;
  });
  const lastActivityRef = useRef(Date.now());
  const autoLockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    checkVaultExists();
    // Load saved key file path and vault file path
    const savedKeyPath = localStorage.getItem('noteit-vault-keyfile');
    if (savedKeyPath) {
      setKeyFilePath(savedKeyPath);
    }
    const savedVaultPath = localStorage.getItem('noteit-vault-path');
    if (savedVaultPath) {
      setVaultFilePath(savedVaultPath);
    }
    return () => {
      if (autoLockTimerRef.current) clearInterval(autoLockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (vaultView === 'entries') {
      autoLockTimerRef.current = setInterval(() => {
        if (Date.now() - lastActivityRef.current > lockTimeout * 60 * 1000) {
          handleLock();
        }
      }, 10000);
      return () => {
        if (autoLockTimerRef.current) clearInterval(autoLockTimerRef.current);
      };
    }
  }, [vaultView, lockTimeout]);

  async function checkVaultExists() {
    // First check if vault is already unlocked (session active)
    const unlocked = await window.electronAPI.vaultIsUnlocked();
    if (unlocked) {
      const entries = await window.electronAPI.vaultGetEntries();
      setEntries(entries);
      setVaultView('entries');
      return;
    }
    const savedVaultPath = localStorage.getItem('noteit-vault-path');
    const savedKeyPath = localStorage.getItem('noteit-vault-keyfile');
    const defaultExists = await window.electronAPI.vaultExists();
    if (defaultExists || (savedVaultPath && savedKeyPath)) {
      setVaultView('unlock');
    } else {
      setVaultView('create');
    }
  }

  async function handleCreate() {
    if (!masterPassword) return;
    if (masterPassword !== confirmPassword) {
      setError(t('vaultConfirmPassword'));
      return;
    }
    if (masterPassword.length < 4) {
      setError(t('vaultMasterPassword'));
      return;
    }
    setError('');
    const result = await window.electronAPI.vaultCreate(masterPassword, vaultName || 'vault');
    if (result.success) {
      if (result.keyFilePath) {
        localStorage.setItem('noteit-vault-keyfile', result.keyFilePath);
        setKeyFilePath(result.keyFilePath);
      }
      if (result.vaultPath) {
        localStorage.setItem('noteit-vault-path', result.vaultPath);
        setVaultFilePath(result.vaultPath);
      }
      const loaded = await window.electronAPI.vaultGetEntries();
      setEntries(loaded);
      setVaultView('entries');
      setSuccessMessage(result.keyFilePath ? `${t('vaultKeyFileSaved')} ${result.keyFilePath}` : '');
      setMasterPassword('');
      setConfirmPassword('');
    }
  }

  async function handleUnlock() {
    if (!masterPassword) return;
    if (!keyFilePath) {
      setError(t('vaultKeyFileRequired'));
      return;
    }
    setError('');
    const ok = await window.electronAPI.vaultUnlock(masterPassword, keyFilePath, vaultFilePath);
    if (ok) {
      // Save paths for convenience
      localStorage.setItem('noteit-vault-keyfile', keyFilePath);
      if (vaultFilePath) {
        localStorage.setItem('noteit-vault-path', vaultFilePath);
      }
      const loaded = await window.electronAPI.vaultGetEntries();
      setEntries(loaded);
      setVaultView('entries');
      setError('');
      setMasterPassword('');
    } else {
      setError(t('vaultWrongPassword'));
    }
  }

  async function handleLock() {
    await window.electronAPI.vaultLock();
    setVaultView('unlock');
    setEntries([]);
    setMasterPassword('');
    setShowForm(false);
    setEditEntry(null);
    setSuccessMessage('');
  }

  async function handleSaveEntry() {
    resetActivity();
    if (formPassword !== formPasswordConfirm) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    const now = new Date().toISOString();
    const entryName = formName || formUsername || formUrl || 'Entry';
    const finalCategory = formCategory === '__new__' ? (customCategory || 'other') : formCategory;
    const entry: VaultEntry = {
      id: editEntry?.id || crypto.randomUUID(),
      name: entryName,
      url: formUrl,
      username: formUsername,
      password: formPassword,
      notes: formNotes,
      category: finalCategory,
      createdAt: editEntry?.createdAt || now,
      updatedAt: now,
    };
    await window.electronAPI.vaultSaveEntry(entry);
    const loaded = await window.electronAPI.vaultGetEntries();
    setEntries(loaded);
    resetForm();
  }

  async function handleDeleteEntry(id: string) {
    resetActivity();
    await window.electronAPI.vaultDeleteEntry(id);
    const loaded = await window.electronAPI.vaultGetEntries();
    setEntries(loaded);
    setConfirmDelete(null);
  }

  function resetForm() {
    setShowForm(false);
    setEditEntry(null);
    setFormName('');
    setFormUrl('');
    setFormUsername('');
    setFormPassword('');
    setFormPasswordConfirm('');
    setFormNotes('');
    setFormCategory('other');
    setCustomCategory('');
    setShowFormPassword(false);
    setShowGenerator(false);
    setGenResult('');
    setPasswordMismatch(false);
  }

  function openEditForm(entry: VaultEntry) {
    resetActivity();
    setEditEntry(entry);
    setFormName(entry.name);
    setFormUrl(entry.url);
    setFormUsername(entry.username);
    setFormPassword(entry.password);
    setFormPasswordConfirm(entry.password);
    setFormNotes(entry.notes);
    setFormCategory(entry.category);
    setShowForm(true);
  }

  async function handleCopy(text: string, entryId?: string) {
    resetActivity();
    setContextMenu(null);
    await navigator.clipboard.writeText(text);
    if (entryId) {
      try {
        const data = JSON.parse(localStorage.getItem('noteit-vault-lastused') || '{}');
        data[entryId] = new Date().toISOString();
        localStorage.setItem('noteit-vault-lastused', JSON.stringify(data));
      } catch {}
    }
    showToast(t('vaultCopied'));
    setTimeout(async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === text) {
          await navigator.clipboard.writeText('');
          showToast(t('vaultAutoCleared'));
        }
      } catch {}
    }, CLIPBOARD_CLEAR_MS);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleGeneratePassword() {
    const pw = await window.electronAPI.vaultGeneratePassword(genLength, {
      uppercase: genUppercase,
      lowercase: genLowercase,
      digits: genDigits,
      special: genSpecial,
    });
    setGenResult(pw);
  }

  function useGeneratedPassword() {
    setFormPassword(genResult);
    setFormPasswordConfirm(genResult);
    setPasswordMismatch(false);
    setShowGenerator(false);
  }

  async function handleSelectKeyFile() {
    const filePath = await window.electronAPI.vaultSelectKeyFile();
    if (filePath) {
      setKeyFilePath(filePath);
      localStorage.setItem('noteit-vault-keyfile', filePath);
    }
  }

  async function handleSelectVaultFile() {
    const filePath = await window.electronAPI.vaultSelectVaultFile();
    if (filePath) {
      setVaultFilePath(filePath);
      localStorage.setItem('noteit-vault-path', filePath);
    }
  }

  function handleContextMenu(e: React.MouseEvent, entry: VaultEntry) {
    e.preventDefault();
    e.stopPropagation();
    resetActivity();
    setContextMenu({ x: e.clientX, y: e.clientY, entry });
  }

  function handleLockTimeoutChange(minutes: number) {
    setLockTimeout(minutes);
    localStorage.setItem('noteit-vault-lock-timeout', String(minutes));
    setShowLockSettings(false);
    resetActivity();
  }

  async function handleExport() {
    resetActivity();
    await window.electronAPI.vaultExport();
  }

  async function handleImportCsv() {
    resetActivity();
    const imported = await window.electronAPI.vaultImportCsv();
    if (imported.length > 0) {
      for (const entry of imported) {
        await window.electronAPI.vaultSaveEntry(entry);
      }
      const loaded = await window.electronAPI.vaultGetEntries();
      setEntries(loaded);
      showToast(`${imported.length} ${t('vaultImported')}`);
    }
  }

  const [showExportAuth, setShowExportAuth] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportKeyPath, setExportKeyPath] = useState<string | null>(null);
  const [exportError, setExportError] = useState('');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpOldPassword, setCpOldPassword] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirmPassword, setCpConfirmPassword] = useState('');
  const [cpKeyPath, setCpKeyPath] = useState<string | null>(null);
  const [cpError, setCpError] = useState('');

  async function handleExportCsv() {
    resetActivity();
    setShowExportAuth(true);
    setExportPassword('');
    setExportKeyPath(keyFilePath || localStorage.getItem('noteit-vault-keyfile'));
    setExportError('');
  }

  async function confirmExportCsv() {
    if (!exportKeyPath || !exportPassword) {
      setExportError(t('vaultWrongPassword'));
      return;
    }
    const ok = await window.electronAPI.vaultUnlock(exportPassword, exportKeyPath, vaultFilePath);
    if (!ok) {
      setExportError(t('vaultWrongPassword'));
      return;
    }
    setShowExportAuth(false);
    setExportPassword('');
    const exported = await window.electronAPI.vaultExportCsv();
    if (exported) {
      showToast(t('vaultExported'));
    }
  }

  function openChangePassword() {
    resetActivity();
    setShowChangePassword(true);
    setCpOldPassword('');
    setCpNewPassword('');
    setCpConfirmPassword('');
    setCpKeyPath(keyFilePath || localStorage.getItem('noteit-vault-keyfile'));
    setCpError('');
  }

  async function confirmChangePassword() {
    if (!cpKeyPath) { setCpError(t('vaultKeyFileRequired')); return; }
    if (!cpOldPassword) { setCpError(t('vaultMasterPassword')); return; }
    if (cpNewPassword.length < 4) { setCpError(t('vaultMasterPassword')); return; }
    if (cpNewPassword !== cpConfirmPassword) { setCpError(t('pinMismatch')); return; }

    const ok = await window.electronAPI.vaultChangePassword(cpOldPassword, cpNewPassword, cpKeyPath);
    if (ok) {
      setShowChangePassword(false);
      showToast(t('vaultPasswordChanged'));
    } else {
      setCpError(t('vaultWrongPassword'));
    }
  }

  async function handleImport() {
    const importedPath = await window.electronAPI.vaultImport();
    if (importedPath) {
      setVaultFilePath(importedPath);
      localStorage.setItem('noteit-vault-path', importedPath);
      showToast(t('vaultImport'));
    }
  }

  function handleCreateNew() {
    setVaultView('create');
    setMasterPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  }

  function toggleShowPassword(id: string) {
    resetActivity();
    setShowPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      social: t('vaultCategorySocial'),
      email: t('vaultCategoryEmail'),
      banking: t('vaultCategoryBanking'),
      work: t('vaultCategoryWork'),
      shopping: t('vaultCategoryShopping'),
      archive: t('vaultCategoryArchive'),
      other: t('vaultCategoryOther'),
    };
    return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  // Compute all categories: defaults (without archive) + custom + archive at end
  const customCats = entries.map((e) => e.category).filter((c) => !DEFAULT_CATEGORIES.includes(c));
  const defaultWithoutArchive = DEFAULT_CATEGORIES.filter((c) => c !== 'archive');
  const allCategories = Array.from(new Set([
    ...defaultWithoutArchive,
    ...customCats,
    'archive',
  ]));

  const filteredEntries = entries.filter((e) => {
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.url.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortMode === 'name') {
      return a.name.localeCompare(b.name, 'pl');
    }
    if (sortMode === 'category') {
      const getOrder = (cat: string) => {
        const idx = DEFAULT_CATEGORIES.indexOf(cat);
        if (idx >= 0) return idx;
        // Custom categories go before 'archive' (second to last)
        return DEFAULT_CATEGORIES.indexOf('archive') - 0.5;
      };
      const aOrder = getOrder(a.category);
      const bOrder = getOrder(b.category);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name, 'pl');
    }
    // recent: by updatedAt desc
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Render loading
  if (vaultView === 'loading') {
    return (
      <div className="vault-overlay" onClick={onClose}>
        <div className="vault-container" onClick={(e) => e.stopPropagation()} />
      </div>
    );
  }

  // Render create/unlock screen
  if (vaultView === 'create' || vaultView === 'unlock') {
    const content = (
      <div className={`vault-container vault-unlock-container ${isWindow ? 'vault-window-mode' : ''}`} onClick={(e) => { e.stopPropagation(); resetActivity(); }}>
          <div className="vault-unlock-header">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            <h2>{t('vaultTitle')}</h2>
          </div>
          {/* Tabs */}
          <div className="vault-tabs">
            <button
              className={`vault-tab ${vaultView === 'unlock' ? 'active' : ''}`}
              onClick={() => { setVaultView('unlock'); setError(''); }}
            >
              {t('vaultUnlock')}
            </button>
            <button
              className={`vault-tab ${vaultView === 'create' ? 'active' : ''}`}
              onClick={() => { setVaultView('create'); setError(''); setSuccessMessage(''); }}
            >
              {t('vaultCreateNew')}
            </button>
          </div>
          <div className="vault-unlock-form">
            {/* === UNLOCK TAB === */}
            {vaultView === 'unlock' && (
              <>
                <div className="vault-keyfile-section">
                  <label className="vault-field-label">{t('vaultVaultFile')}</label>
                  <div className="vault-keyfile-actions">
                    {vaultFilePath ? (
                      <span className="vault-keyfile-path vault-keyfile-fullpath">{vaultFilePath}</span>
                    ) : (
                      <span className="vault-keyfile-path vault-keyfile-none">{t('vaultKeyFileRequired')}</span>
                    )}
                    <button className="vault-btn-sm" onClick={handleSelectVaultFile}>
                      {t('vaultSelectVaultFile')}
                    </button>
                  </div>
                </div>
                <div className="vault-keyfile-section">
                  <label className="vault-field-label">{t('vaultKeyFile')}</label>
                  <div className="vault-keyfile-actions">
                    {keyFilePath ? (
                      <span className="vault-keyfile-path vault-keyfile-fullpath">{keyFilePath}</span>
                    ) : (
                      <span className="vault-keyfile-path vault-keyfile-none">{t('vaultKeyFileRequired')}</span>
                    )}
                    <button className="vault-btn-sm" onClick={handleSelectKeyFile}>
                      {t('vaultSelectKeyFile')}
                    </button>
                  </div>
                </div>
                <input
                  type="password"
                  className="vault-input"
                  placeholder={t('vaultMasterPassword')}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock(); }}
                  autoFocus
                />
              </>
            )}
            {/* === CREATE TAB === */}
            {vaultView === 'create' && (
              <>
                <input
                  type="text"
                  className="vault-input"
                  placeholder={t('vaultName')}
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  autoFocus
                />
                <input
                  type="password"
                  className="vault-input"
                  placeholder={t('vaultMasterPassword')}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="vault-input"
                  placeholder={t('vaultConfirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
              </>
            )}
            {/* Error / Success */}
            {error && <div className="vault-error">{error}</div>}
            {successMessage && <div className="vault-success">{successMessage}</div>}
            {/* Action button */}
            <button
              className="vault-btn-primary"
              onClick={vaultView === 'create' ? handleCreate : handleUnlock}
            >
              {vaultView === 'create' ? t('vaultCreate') : t('vaultUnlock')}
            </button>
          </div>
      </div>
    );

    if (isWindow) return content;
    return (
      <div className="vault-overlay" onClick={onClose}>
        {content}
      </div>
    );
  }

  // Entries view
  const entriesView = (
    <div className={`vault-container vault-main ${isWindow ? 'vault-window-mode' : ''}`} onClick={(e) => { e.stopPropagation(); resetActivity(); }}>
        {/* Header */}
        <div className="vault-header">
          <div className="vault-header-title">
            <h2>{t('vaultTitle')}</h2>
            <span className="vault-entry-count">{entries.length}</span>
          </div>
          <div className="vault-header-actions">
            {!isWindow && (
              <button className="btn-icon" onClick={() => { localStorage.setItem('noteit-vault-mode', 'window'); window.electronAPI.openVaultWindow(); onClose(); }} data-tooltip={t('vaultOpenWindow')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            )}
            {isWindow && (
              <button className="btn-icon" onClick={() => { localStorage.setItem('noteit-vault-mode', 'modal'); window.electronAPI.focusMainWindow(); window.electronAPI.closeVaultWindow(); }} data-tooltip={t('vaultBackToModal')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
            )}
            <button className="btn-icon" onClick={handleImportCsv} data-tooltip={t('vaultImportCsv')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button className="btn-icon" onClick={handleExportCsv} data-tooltip={t('vaultExportCsv')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </button>
            <button className="btn-icon" onClick={openChangePassword} data-tooltip={t('vaultChangePassword')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </button>
            <div className="vault-lock-timeout-wrapper">
              <button className="btn-icon" onClick={() => setShowLockSettings(!showLockSettings)} data-tooltip={t('vaultLockTimeout')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </button>
              {showLockSettings && (
                <div className="vault-lock-dropdown">
                  {LOCK_TIMEOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`vault-lock-option ${lockTimeout === opt.value ? 'active' : ''}`}
                      onClick={() => handleLockTimeoutChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-icon vault-lock-btn" onClick={() => setConfirmLock(true)} data-tooltip={t('vaultLock')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search + Add */}
        <div className="vault-toolbar">
          <div className="vault-search-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="vault-search"
              placeholder={t('vaultSearch')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetActivity(); }}
            />
          </div>
          <select className="vault-sort-select" value={sortMode} onChange={(e) => { const v = e.target.value as any; setSortMode(v); localStorage.setItem('noteit-vault-sort', v); }}>
            <option value="recent">{t('vaultSortRecent')}</option>
            <option value="name">{t('vaultSortName')}</option>
            <option value="category">{t('vaultSortCategory')}</option>
          </select>
          <button className="vault-btn-primary vault-btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t('vaultAddEntry')}
          </button>
        </div>

        {/* Category filter */}
        <div className="vault-categories">
          <button
            className={`vault-cat-pill ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setCategoryFilter('all'); resetActivity(); }}
          >
            {t('vaultAll')}
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`vault-cat-pill ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => { setCategoryFilter(cat); resetActivity(); }}
              style={categoryFilter === cat ? { background: categoryColors[cat] || '#6b7280', color: '#fff' } : {}}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Entries list */}
        <div className="vault-entries">
          {filteredEntries.length === 0 ? (
            <div className="vault-empty">{t('vaultEmpty')}</div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="vault-entry" onContextMenu={(e) => handleContextMenu(e, entry)} onDoubleClick={() => openEditForm(entry)}>
                <div className="vault-entry-icon" style={{ background: categoryColors[entry.category] || '#6b7280' }}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div className="vault-entry-info">
                  <div className="vault-entry-name">
                    {entry.name}
                    {getDaysSinceUpdate(entry.updatedAt) > 90 && (
                      <span className="vault-pw-old-warning" title={`${t('vaultOldPasswordWarning')} ${getDaysSinceUpdate(entry.updatedAt)} ${t('vaultDays')}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="vault-entry-username">{entry.username}</div>
                  {entry.url && <div className="vault-entry-url">{entry.url}</div>}
                </div>
                <div className="vault-entry-password-col">
                  <span className="vault-entry-pw">
                    {showPasswords.has(entry.id) ? entry.password : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                  </span>
                  <span className={`vault-pw-strength vault-pw-${getPasswordStrength(entry.password)}`} title={t(strengthLabelKey[getPasswordStrength(entry.password)])} />
                  <button className="vault-btn-icon-sm" onClick={() => toggleShowPassword(entry.id)} data-tooltip={showPasswords.has(entry.id) ? 'Hide' : 'Show'}>
                    {showPasswords.has(entry.id) ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <div className="vault-entry-actions">
                  <button className="vault-btn-icon-sm" onClick={() => handleCopy(entry.username)} data-tooltip={t('vaultCopyUsername')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
                  </button>
                  <button className="vault-btn-icon-sm" onClick={() => handleCopy(entry.password, entry.id)} data-tooltip={t('vaultCopyPassword')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button className="vault-btn-icon-sm" onClick={() => openEditForm(entry)} data-tooltip={t('vaultEditEntry')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="vault-btn-icon-sm vault-btn-danger" onClick={() => setConfirmDelete(entry.id)} data-tooltip={t('delete')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit form modal */}
        {showForm && (
          <div className="vault-form-overlay" onClick={() => resetForm()}>
            <div className="vault-form" onClick={(e) => e.stopPropagation()}>
              <h3>{editEntry ? t('vaultEditEntry') : t('vaultAddEntry')}</h3>
              {editEntry && getLastUsedText(editEntry.id, t) && (
                <div className="vault-entry-lastused">{getLastUsedText(editEntry.id, t)}</div>
              )}
              <input className="vault-input" placeholder={t('vaultName')} value={formName} onChange={(e) => setFormName(e.target.value)} autoFocus />
              <input className="vault-input" placeholder={t('vaultUrl')} value={formUrl} onChange={(e) => setFormUrl(e.target.value)} />
              <input className="vault-input" placeholder={t('vaultUsername')} value={formUsername} onChange={(e) => setFormUsername(e.target.value)} />
              <div className="vault-password-field">
                <input
                  className="vault-input"
                  type={showFormPassword ? 'text' : 'password'}
                  placeholder={t('vaultPassword')}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
                <button className="vault-btn-icon-sm vault-pw-toggle" onClick={() => setShowFormPassword(!showFormPassword)}>
                  {showFormPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
                <button className="vault-btn-icon-sm vault-gen-toggle" onClick={() => { setShowGenerator(!showGenerator); handleGeneratePassword(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                </button>
              </div>
              {/* Confirm password */}
              <input
                className={`vault-input ${passwordMismatch ? 'vault-input-error' : ''}`}
                type={showFormPassword ? 'text' : 'password'}
                placeholder={t('vaultConfirmPassword')}
                value={formPasswordConfirm}
                onChange={(e) => { setFormPasswordConfirm(e.target.value); setPasswordMismatch(false); }}
              />
              {passwordMismatch && <div className="vault-error">{t('pinMismatch')}</div>}
              {formPassword && (
                <div className="vault-strength-bar-wrapper">
                  <div className={`vault-strength-bar vault-strength-${getPasswordStrength(formPassword)}`} />
                  <span className="vault-strength-label">{t(strengthLabelKey[getPasswordStrength(formPassword)])}</span>
                </div>
              )}
              {/* Password generator inline */}
              {showGenerator && (
                <div className="vault-generator">
                  <div className="vault-gen-row">
                    <label>{t('vaultPasswordLength')}: {genLength}</label>
                    <input type="range" min="8" max="64" value={genLength} onChange={(e) => setGenLength(Number(e.target.value))} />
                  </div>
                  <div className="vault-gen-options">
                    <label className="vault-checkbox-label"><input type="checkbox" checked={genUppercase} onChange={(e) => setGenUppercase(e.target.checked)} /> {t('vaultUppercase')}</label>
                    <label className="vault-checkbox-label"><input type="checkbox" checked={genLowercase} onChange={(e) => setGenLowercase(e.target.checked)} /> {t('vaultLowercase')}</label>
                    <label className="vault-checkbox-label"><input type="checkbox" checked={genDigits} onChange={(e) => setGenDigits(e.target.checked)} /> {t('vaultDigits')}</label>
                    <label className="vault-checkbox-label"><input type="checkbox" checked={genSpecial} onChange={(e) => setGenSpecial(e.target.checked)} /> {t('vaultSpecial')}</label>
                  </div>
                  {genResult && (
                    <div className="vault-gen-result">
                      <code>{genResult}</code>
                      <span className={`vault-pw-strength vault-pw-${getPasswordStrength(genResult)}`} title={t(strengthLabelKey[getPasswordStrength(genResult)])} />
                      <button className="vault-btn-sm" onClick={useGeneratedPassword}>{t('set')}</button>
                      <button className="vault-btn-sm" onClick={handleGeneratePassword}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <textarea className="vault-textarea" placeholder={t('vaultNotes')} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} />
              <select className="vault-select" value={formCategory} onChange={(e) => { setFormCategory(e.target.value); if (e.target.value !== '__new__') setCustomCategory(''); }}>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                ))}
                <option value="__new__">{t('vaultNewCategory')}</option>
              </select>
              {formCategory === '__new__' && (
                <input
                  className="vault-input"
                  placeholder={t('vaultCategoryName')}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
              <div className="vault-form-actions">
                <button className="vault-btn-secondary" onClick={resetForm}>{t('cancel')}</button>
                <button className="vault-btn-primary" onClick={handleSaveEntry} disabled={(!formName && !formUsername && !formUrl) || (formCategory === '__new__' && !customCategory)}>
                  {editEntry ? t('vaultEditEntry') : t('vaultAddEntry')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="vault-form-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="vault-confirm" onClick={(e) => e.stopPropagation()}>
              <p>{t('vaultDeleteConfirm')}</p>
              <div className="vault-form-actions">
                <button className="vault-btn-secondary" onClick={() => setConfirmDelete(null)}>{t('cancel')}</button>
                <button className="vault-btn-danger-solid" onClick={() => handleDeleteEntry(confirmDelete)}>{t('delete')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Lock confirmation */}
        {confirmLock && (
          <div className="vault-form-overlay" onClick={() => setConfirmLock(false)}>
            <div className="vault-confirm" onClick={(e) => e.stopPropagation()}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p>{t('vaultLockConfirm')}</p>
              <div className="vault-form-actions">
                <button className="vault-btn-secondary" onClick={() => setConfirmLock(false)}>{t('cancel')}</button>
                <button className="vault-btn-primary" onClick={() => { setConfirmLock(false); handleLock(); }}>{t('vaultLock')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Export auth modal */}
        {showExportAuth && (
          <div className="vault-form-overlay" onClick={() => setShowExportAuth(false)}>
            <div className="vault-form" onClick={(e) => e.stopPropagation()} style={{ width: 380 }}>
              <h3>{t('vaultExportCsv')}</h3>
              <div className="vault-keyfile-section">
                <label className="vault-field-label">{t('vaultKeyFile')}</label>
                <div className="vault-keyfile-actions">
                  {exportKeyPath ? (
                    <span className="vault-keyfile-path vault-keyfile-fullpath">{exportKeyPath}</span>
                  ) : (
                    <span className="vault-keyfile-path vault-keyfile-none">{t('vaultKeyFileRequired')}</span>
                  )}
                  <button className="vault-btn-sm" onClick={async () => { const p = await window.electronAPI.vaultSelectKeyFile(); if (p) setExportKeyPath(p); }}>
                    {t('vaultSelectKeyFile')}
                  </button>
                </div>
              </div>
              <input
                type="password"
                className="vault-input"
                placeholder={t('vaultMasterPassword')}
                value={exportPassword}
                onChange={(e) => { setExportPassword(e.target.value); setExportError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmExportCsv(); }}
                autoFocus
              />
              {exportError && <div className="vault-error">{exportError}</div>}
              <div className="vault-form-actions">
                <button className="vault-btn-secondary" onClick={() => setShowExportAuth(false)}>{t('cancel')}</button>
                <button className="vault-btn-primary" onClick={confirmExportCsv}>{t('vaultExportCsv')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Change password modal */}
        {showChangePassword && (
          <div className="vault-form-overlay" onClick={() => setShowChangePassword(false)}>
            <div className="vault-form" onClick={(e) => e.stopPropagation()} style={{ width: 380 }}>
              <h3>{t('vaultChangePassword')}</h3>
              <div className="vault-keyfile-section">
                <label className="vault-field-label">{t('vaultKeyFile')}</label>
                <div className="vault-keyfile-actions">
                  {cpKeyPath ? (
                    <span className="vault-keyfile-path vault-keyfile-fullpath">{cpKeyPath}</span>
                  ) : (
                    <span className="vault-keyfile-path vault-keyfile-none">{t('vaultKeyFileRequired')}</span>
                  )}
                  <button className="vault-btn-sm" onClick={async () => { const p = await window.electronAPI.vaultSelectKeyFile(); if (p) setCpKeyPath(p); }}>
                    {t('vaultSelectKeyFile')}
                  </button>
                </div>
              </div>
              <input
                type="password"
                className="vault-input"
                placeholder={t('vaultOldPassword')}
                value={cpOldPassword}
                onChange={(e) => { setCpOldPassword(e.target.value); setCpError(''); }}
                autoFocus
              />
              <input
                type="password"
                className="vault-input"
                placeholder={t('vaultNewPassword')}
                value={cpNewPassword}
                onChange={(e) => { setCpNewPassword(e.target.value); setCpError(''); }}
              />
              <input
                type="password"
                className="vault-input"
                placeholder={t('vaultConfirmPassword')}
                value={cpConfirmPassword}
                onChange={(e) => { setCpConfirmPassword(e.target.value); setCpError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmChangePassword(); }}
              />
              {cpError && <div className="vault-error">{cpError}</div>}
              <div className="vault-form-actions">
                <button className="vault-btn-secondary" onClick={() => setShowChangePassword(false)}>{t('cancel')}</button>
                <button className="vault-btn-primary" onClick={confirmChangePassword}>{t('vaultChangePassword')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Context menu */}
        {contextMenu && (
          <div className="vault-context-overlay" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}>
            <div className="vault-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
              <button className="vault-context-item" onClick={() => handleCopy(contextMenu.entry.password, contextMenu.entry.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {t('vaultCopyPassword')}
              </button>
              <button className="vault-context-item" onClick={() => handleCopy(contextMenu.entry.username)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
                {t('vaultCopyUsername')}
              </button>
              {contextMenu.entry.url && (
                <button className="vault-context-item" onClick={() => { handleCopy(contextMenu.entry.url); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  {t('vaultCopyUrl')}
                </button>
              )}
              <div className="vault-context-separator" />
              <button className="vault-context-item" onClick={() => { setContextMenu(null); openEditForm(contextMenu.entry); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {t('vaultEditEntry')}
              </button>
              <button className="vault-context-item vault-context-danger" onClick={() => { setContextMenu(null); setConfirmDelete(contextMenu.entry.id); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                {t('delete')}
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <div className="vault-toast">{toast}</div>}
    </div>
  );

  if (isWindow) return entriesView;
  return (
    <div className="vault-overlay" onClick={onClose}>
      {entriesView}
    </div>
  );
}
