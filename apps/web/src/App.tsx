import { useMemo, useState } from 'react';
import { login, type Session } from './lib/api';
import { LoginPage } from './pages/LoginPage';
import { PostsPage } from './pages/PostsPage';

const SESSION_STORAGE_KEY = 'heroui-placeholder-session';

function loadSession(): Session | null {
  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as Session;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const actions = useMemo(
    () => ({
      async onLogin(identifier: string, password: string) {
        const nextSession = await login(identifier, password);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      },
      onLogout() {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setSession(null);
      },
    }),
    [],
  );

  if (!session) {
    return <LoginPage onLogin={actions.onLogin} />;
  }

  return <PostsPage session={session} onLogout={actions.onLogout} />;
}
