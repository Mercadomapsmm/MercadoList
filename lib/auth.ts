import { User, StoredUserAccount } from '@/types/auth';

const STORAGE_USERS_KEY = 'lista_compras_domestica_users';
const STORAGE_CURRENT_USER_KEY = 'lista_compras_domestica_current_user';

// Contas padrão pré-configuradas para demonstração e primeiro acesso rápido
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'user-familia',
    username: 'usuario',
    name: 'Família',
    passwordHash: '123456',
    createdAt: 1700000000000,
  },
  {
    id: 'user-admin',
    username: 'admin',
    name: 'Administrador',
    passwordHash: 'admin123',
    createdAt: 1700000000000,
  },
];

export function getStoredAccounts(): StoredUserAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const accounts: StoredUserAccount[] = JSON.parse(raw);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return accounts;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function loginUser(usernameInput: string, passwordInput: string): { success: boolean; user?: User; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: 'Por favor, informe seu usuário ou e-mail.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Por favor, informe sua senha.' };
  }

  const accounts = getStoredAccounts();
  const account = accounts.find(
    (acc) => acc.username.toLowerCase() === cleanUsername
  );

  if (!account) {
    return { success: false, error: 'Usuário não encontrado. Verifique os dados ou crie uma conta nova.' };
  }

  if (account.passwordHash !== cleanPassword) {
    return { success: false, error: 'Senha incorreta. Tente novamente.' };
  }

  const user: User = {
    id: account.id,
    username: account.username,
    name: account.name,
    createdAt: account.createdAt,
  };

  setCurrentUser(user);
  return { success: true, user };
}

export function registerUser(nameInput: string, usernameInput: string, passwordInput: string): { success: boolean; user?: User; error?: string } {
  const cleanName = nameInput.trim();
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanName) {
    return { success: false, error: 'Por favor, digite seu nome ou apelido.' };
  }
  if (!cleanUsername) {
    return { success: false, error: 'Por favor, escolha um nome de usuário.' };
  }
  if (cleanUsername.length < 3) {
    return { success: false, error: 'O nome de usuário deve ter no mínimo 3 caracteres.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Por favor, crie uma senha.' };
  }
  if (cleanPassword.length < 4) {
    return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' };
  }

  const accounts = getStoredAccounts();
  const exists = accounts.some(
    (acc) => acc.username.toLowerCase() === cleanUsername
  );

  if (exists) {
    return { success: false, error: 'Este nome de usuário já está em uso. Por favor, escolha outro.' };
  }

  const newAccount: StoredUserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    name: cleanName,
    passwordHash: cleanPassword,
    createdAt: Date.now(),
  };

  accounts.push(newAccount);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore
    }
  }

  const user: User = {
    id: newAccount.id,
    username: newAccount.username,
    name: newAccount.name,
    createdAt: newAccount.createdAt,
  };

  setCurrentUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentUser(null);
}
