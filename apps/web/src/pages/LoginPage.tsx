import { FormEvent, useState } from 'react';
import { Button, Card, Input } from '@heroui/react';

interface LoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('Bret');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin(identifier, password);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <Card.Header className="section-header">
          <div>
            <p className="eyebrow">HeroUI + Placeholder API</p>
            <h1>Post 管理演示</h1>
            <p className="muted">使用 JSONPlaceholder 用户登录并管理 posts。</p>
          </div>
        </Card.Header>
        <Card.Content>
          <form className="stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>用户名或邮箱</span>
              <Input
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>
            <label className="field">
              <span>密码</span>
              <Input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? <p className="error-text">{error}</p> : null}
            <Button isDisabled={isSubmitting} type="submit" variant="primary">
              {isSubmitting ? '登录中...' : '登录'}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </main>
  );
}
