'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { loginUser, registerUser } from '@/lib/auth';
import { ShoppingCart, LogIn, UserPlus, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = loginUser(loginUsername, loginPassword);
    setIsLoading(false);

    if (result.success && result.user) {
      if (soundEnabled) playAddSound();
      onLoginSuccess(result.user);
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
      setSuccessMessage('Conta criada com sucesso! Entrando...');
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 500);
    } else {
      setErrorMessage(result.error || 'Erro ao cadastrar usuário.');
    }
  };

  const handleQuickDemo = (user: string, pass: string) => {
    setErrorMessage(null);
    setLoginUsername(user);
    setLoginPassword(pass);
    const result = loginUser(user, pass);
    if (result.success && result.user) {
      if (soundEnabled) playAddSound();
      onLoginSuccess(result.user);
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
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Acesse sua conta para visualizar e organizar suas compras
          </p>
        </div>

        {/* Tab Switcher */}
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
            <span>Criar Conta</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="auth-error-alert"
            className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-start gap-2 animate-shake"
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

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Usuário ou E-mail
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
                  placeholder="Ex: usuario ou admin"
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

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Acesso Rápido de Teste:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="demo-login-familia-btn"
                  type="button"
                  onClick={() => handleQuickDemo('usuario', '123456')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors"
                >
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Família</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">usuario / 123456</p>
                </button>
                <button
                  id="demo-login-admin-btn"
                  type="button"
                  onClick={() => handleQuickDemo('admin', 'admin123')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors"
                >
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Administrador</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">admin / admin123</p>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
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
                placeholder="Ex: Maria, Casa da Família, etc."
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
                  placeholder="Ex: maria, casa2"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                    highContrast
                      ? 'bg-zinc-900 border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 dark:text-white'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Sem espaços e com no mínimo 3 letras.
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
                  placeholder="No mínimo 4 caracteres"
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
              <span>{isLoading ? 'Cadastrando...' : 'Criar Conta e Acessar'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
