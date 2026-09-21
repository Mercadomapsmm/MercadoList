'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import {
  loginUser,
  registerUser,
  hasUserCreatedAccount,
  getStoredAccounts,
  isAutoLoginEnabled,
} from '@/lib/auth';
import {
  ShoppingCart,
  LogIn,
  UserPlus,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { playAddSound } from '@/lib/sound';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  soundEnabled: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  highContrast,
  onToggleHighContrast,
  soundEnabled,
}) => {
  // Inicializações preguiçosas para evitar hydration cascading renders
  const [hasCreatedAccount, setHasCreatedAccount] = useState<boolean>(() => {
    return hasUserCreatedAccount();
  });
  const [savedAccounts, setSavedAccounts] = useState<Array<{ id: string; username: string; name: string }>>(() => {
    return getStoredAccounts();
  });
  const [tab, setTab] = useState<'register' | 'login'>(() => {
    const hasAccount = hasUserCreatedAccount();
    const accounts = getStoredAccounts();
    return (!hasAccount || accounts.length === 0) ? 'register' : 'login';
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState(() => {
    const accounts = getStoredAccounts();
    return accounts.length > 0 ? accounts[accounts.length - 1].username : '';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = loginUser(loginUsername, loginPassword, rememberMe);
    setIsLoading(false);

    if (result.success && result.user) {
      if (soundEnabled) playAddSound();
      setSuccessMessage(`Bem-vindo de volta, ${result.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 350);
    } else {
      setErrorMessage(result.error || 'Erro ao realizar login.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Verifique e tente novamente.');
      return;
    }

    setIsLoading(true);
    const result = registerUser(regName, regUsername, regPassword);
    setIsLoading(false);

    if (result.success && result.user) {
      if (soundEnabled) playAddSound();
      setSuccessMessage('Conta criada com sucesso! O login será automático nas próximas vezes.');
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 500);
    } else {
      setErrorMessage(result.error || 'Erro ao cadastrar usuário.');
    }
  };

  // Preenchimento de teste rápido em 1 clique
  const handleQuickDemoRegister = () => {
    setErrorMessage(null);
    setRegName('Família');
    setRegUsername('usuario');
    setRegPassword('123456');
    setRegConfirmPassword('123456');

    setIsLoading(true);
    const result = registerUser('Família', 'usuario', '123456');
    setIsLoading(false);

    if (result.success && result.user) {
      if (soundEnabled) playAddSound();
      setSuccessMessage('Conta rápida criada! Entrando na lista...');
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 400);
    } else {
      // Se já existir, faz login direto
      const loginRes = loginUser('usuario', '123456', true);
      if (loginRes.success && loginRes.user) {
        if (soundEnabled) playAddSound();
        onLoginSuccess(loginRes.user);
      }
    }
  };

  return (
    <div
      id="auth-screen-container"
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        highContrast ? 'bg-black text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Top Accessibility Contrast Toggle */}
      <div className="w-full max-w-md flex justify-end mb-3">
        <button
          id="auth-toggle-contrast-btn"
          type="button"
          onClick={onToggleHighContrast}
          className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border transition-all ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-300 font-extrabold'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          {highContrast ? '✓ Alto Contraste Ativado' : 'Alternar Alto Contraste'}
        </button>
      </div>

      {/* Main Auth Card */}
      <div
        id="auth-card"
        className={`w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-xl border transition-all ${
          highContrast
            ? 'bg-black border-2 border-yellow-400 text-white ring-2 ring-yellow-400/50'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-3">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Lista de Compras
          </h1>

          {!hasCreatedAccount ? (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-medium">
              <p className="font-bold flex items-center justify-center gap-1.5 mb-0.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                Crie seu Usuário e Senha para começar
              </p>
              <p className="text-[11px] opacity-80">
                O login será automático nas próximas vezes que você abrir o app!
              </p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Acesse sua conta para visualizar e organizar suas compras
            </p>
          )}
        </div>

        {/* Tab Switcher (visível se já existirem contas ou para alternar) */}
        {hasCreatedAccount && (
          <div
            id="auth-tabs"
            className={`flex rounded-xl p-1 mb-6 border ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? highContrast
                    ? 'bg-yellow-400 text-black shadow font-black'
                    : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>

            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? highContrast
                    ? 'bg-yellow-400 text-black shadow font-black'
                    : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Nova Conta</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="auth-error-alert"
            className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            id="auth-success-alert"
            className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. REGISTER FORM (Solicitação de criação de usuário e senha) */}
        {tab === 'register' && (
          <form id="register-form" onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Seu Nome ou Apelido
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Família, Maria, João"
                className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                  highContrast
                    ? 'bg-zinc-900 border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 dark:text-white'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="register-username"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Nome de Usuário (login)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Ex: usuario, maria, casa"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                    highContrast
                      ? 'bg-zinc-900 border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 dark:text-white'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Letras e números (mínimo de 3 caracteres).
              </p>
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Crie uma Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="register-password"
                  name="password"
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Crie sua senha de acesso"
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                    highContrast
                      ? 'bg-zinc-900 border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 dark:text-white'
                  }`}
                />
                <button
                  id="toggle-register-password-visibility"
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showRegPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Confirme a Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repita a senha criada"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                    highContrast
                      ? 'bg-zinc-900 border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 dark:text-white'
                  }`}
                />
              </div>
            </div>

            {/* Aviso de Login Automático */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>O login ficará gravado e será automático nas próximas visitas.</span>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>{isLoading ? 'Criando conta...' : 'Criar Conta e Acessar Lista'}</span>
            </button>

            {/* Opção de teste rápido */}
            <div className="pt-2 text-center">
              <button
                id="quick-demo-register-btn"
                type="button"
                onClick={handleQuickDemoRegister}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold underline flex items-center justify-center gap-1 mx-auto"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Preencher com conta de teste rápido (Família)</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. LOGIN FORM (Para quando o usuário já criou usuário e senha e deseja entrar) */}
        {tab === 'login' && (
          <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                    highContrast
                      ? 'bg-zinc-900 border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 dark:text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                    highContrast
                      ? 'bg-zinc-900 border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 dark:text-white'
                  }`}
                />
                <button
                  id="toggle-login-password-visibility"
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showLoginPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox de Login Automático */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
              />
              <label
                htmlFor="remember-me-checkbox"
                className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Entrar automaticamente neste aparelho
              </label>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              <LogIn className="w-5 h-5" />
              <span>{isLoading ? 'Entrando...' : 'Entrar na Lista de Compras'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
