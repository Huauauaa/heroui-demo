import { FormEvent, useState } from 'react';
import { Alert, Avatar, Button, Card, Chip, Input, Label, Separator, Surface } from '@heroui/react';

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
      <section className="auth-layout">
        <Card className="hero-card" variant="tertiary">
          <Card.Header className="hero-card__header">
            <Avatar color="accent" size="lg" variant="soft">
              <Avatar.Fallback>HP</Avatar.Fallback>
            </Avatar>
            <div>
              <p className="eyebrow">HeroUI Workspace</p>
              <Card.Title>轻量 Post 工作台</Card.Title>
              <Card.Description>用 JSONPlaceholder 快速演示登录、筛选和 Post 管理流程。</Card.Description>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="feature-list">
              <Chip color="accent" variant="soft">
                React 19
              </Chip>
              <Chip color="success" variant="soft">
                HeroUI v3
              </Chip>
              <Chip color="warning" variant="soft">
                Placeholder API
              </Chip>
            </div>
            <Surface className="demo-panel" variant="secondary">
              <p className="eyebrow">Demo Account</p>
              <div className="demo-grid">
                <span>用户名</span>
                <strong>Bret</strong>
                <span>密码</span>
                <strong>demo123</strong>
              </div>
            </Surface>
          </Card.Content>
        </Card>

        <Card className="auth-card">
          <Card.Header className="section-header">
            <div>
              <p className="eyebrow">Welcome back</p>
              <Card.Title>登录控制台</Card.Title>
              <Card.Description>使用 JSONPlaceholder 用户名或邮箱登录。</Card.Description>
            </div>
          </Card.Header>
          <Separator variant="tertiary" />
          <Card.Content>
            <form className="stack" onSubmit={handleSubmit}>
              <div className="field">
                <Label htmlFor="identifier">用户名或邮箱</Label>
                <Input
                  fullWidth
                  required
                  autoComplete="username"
                  id="identifier"
                  placeholder="例如 Bret 或 Sincere@april.biz"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </div>
              <div className="field">
                <Label htmlFor="password">密码</Label>
                <Input
                  fullWidth
                  required
                  autoComplete="current-password"
                  id="password"
                  minLength={6}
                  placeholder="输入 demo123"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {error ? (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>登录失败</Alert.Title>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}
              <Button isDisabled={isSubmitting} type="submit" variant="primary">
                {isSubmitting ? '登录中...' : '登录并进入 Post 管理'}
              </Button>
            </form>
          </Card.Content>
          <Card.Footer className="auth-footer">
            <span>演示账号已预填，可直接提交体验。</span>
          </Card.Footer>
        </Card>
      </section>
    </main>
  );
}
