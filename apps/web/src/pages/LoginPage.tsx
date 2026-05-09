import { FormEvent, useState } from 'react';
import { Alert, Avatar, Button, Card, Chip, Input, Label, Separator, Surface } from '@heroui/react';

const DEMO_ACCOUNTS = [
  {
    description: '经典演示账号',
    email: 'Sincere@april.biz',
    username: 'Bret',
  },
  {
    description: '内容协作视角',
    email: 'Shanna@melissa.tv',
    username: 'Antonette',
  },
];

interface LoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('Bret');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
      <div className="auth-ambient" aria-hidden="true">
        <span className="auth-blob auth-blob--pink" />
        <span className="auth-blob auth-blob--blue" />
        <span className="auth-blob auth-blob--gold" />
      </div>
      <section className="auth-layout">
        <Card className="hero-card" variant="tertiary">
          <span className="float-orb float-orb--lg" aria-hidden="true" />
          <span className="float-orb float-orb--sm" aria-hidden="true" />
          <Card.Header className="hero-card__header">
            <Avatar color="accent" size="lg" variant="soft">
              <Avatar.Fallback>HP</Avatar.Fallback>
            </Avatar>
            <div>
              <p className="eyebrow">HeroUI Workspace</p>
              <Card.Title>欢迎进入 Post 工作台</Card.Title>
              <Card.Description>用 JSONPlaceholder 快速体验登录、筛选和 Post 管理流程。</Card.Description>
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
            <div className="hero-preview" aria-hidden="true">
              <div className="hero-preview__toolbar">
                <span />
                <span />
                <span />
              </div>
              <div className="hero-preview__body">
                <div>
                  <span>今日 Posts</span>
                  <strong>12</strong>
                </div>
                <div>
                  <span>草稿同步</span>
                  <strong>98%</strong>
                </div>
              </div>
            </div>
            <Surface className="demo-panel" variant="secondary">
              <div className="demo-panel__header">
                <div>
                  <p className="eyebrow">Demo Account</p>
                  <strong>选择一个演示身份</strong>
                </div>
                <Chip color="success" size="sm" variant="soft">
                  密码 demo123
                </Chip>
              </div>
              <div className="demo-account-list">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    className="demo-account"
                    key={account.username}
                    type="button"
                    onClick={() => {
                      setIdentifier(account.username);
                      setPassword('demo123');
                      setError('');
                    }}
                  >
                    <span>
                      <strong>{account.username}</strong>
                      <small>{account.description}</small>
                    </span>
                    <small>{account.email}</small>
                  </button>
                ))}
              </div>
            </Surface>
          </Card.Content>
        </Card>

        <Card className="auth-card">
          <Card.Header className="section-header">
            <div>
              <p className="eyebrow">Welcome back</p>
              <Card.Title>登录控制台</Card.Title>
              <Card.Description>使用用户名或邮箱登录，演示密码统一为 demo123。</Card.Description>
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
                  variant="secondary"
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    setError('');
                  }}
                />
              </div>
              <div className="field">
                <div className="field-row">
                  <Label htmlFor="password">密码</Label>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                  >
                    {isPasswordVisible ? '隐藏密码' : '显示密码'}
                  </button>
                </div>
                <Input
                  fullWidth
                  required
                  autoComplete="current-password"
                  id="password"
                  minLength={6}
                  placeholder="输入 demo123"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  variant="secondary"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
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
              <div className="auth-actions">
                <Button isDisabled={isSubmitting} type="submit" variant="primary">
                  {isSubmitting ? '登录中...' : '登录并进入 Post 管理'}
                </Button>
                <span>提交后会保存本地演示会话。</span>
              </div>
            </form>
          </Card.Content>
          <Card.Footer className="auth-footer">
            <span>参考 login-demos 的现代分栏和透明漂浮视觉，适配为当前 React 登录页。</span>
          </Card.Footer>
        </Card>
      </section>
    </main>
  );
}
