import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  Input,
  Label,
  Separator,
  Spinner,
  Surface,
  Switch,
  TextArea,
} from '@heroui/react';
import {
  createPost,
  deletePost,
  listPosts,
  type Post,
  type PostPayload,
  type Session,
  updatePost,
} from '../lib/api';

const EMPTY_FORM = {
  title: '',
  body: '',
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface PostsPageProps {
  session: Session;
  onLogout: () => void;
}

export function PostsPage({ session, onLogout }: PostsPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(true);

  const editingPost = useMemo(
    () => posts.find((post) => post.id === editingId),
    [editingId, posts],
  );

  const postStats = useMemo(() => {
    const wordCount = posts.reduce(
      (total, post) => total + post.body.split(/\s+/).filter(Boolean).length,
      0,
    );

    return {
      averageWords: posts.length ? Math.round(wordCount / posts.length) : 0,
      count: posts.length,
      wordCount,
    };
  }, [posts]);

  async function refresh(nextShowOnlyMine = showOnlyMine) {
    setIsLoading(true);
    setError('');

    try {
      setPosts(await listPosts(nextShowOnlyMine ? session.user.id : undefined));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '加载 posts 失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh(true);
    // session.user.id is stable while logged in; refresh is kept local for UI state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function beginEdit(post: Post) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      body: post.body,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    const payload: PostPayload = {
      title: form.title.trim(),
      body: form.body.trim(),
      userId: session.user.id,
    };

    if (!payload.title || !payload.body) {
      setError('标题和内容不能为空');
      setIsSaving(false);
      return;
    }

    try {
      if (editingId) {
        const updatedPost = await updatePost(editingId, payload);
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === editingId ? { ...post, ...updatedPost, ...payload } : post,
          ),
        );
      } else {
        const createdPost = await createPost(payload);
        setPosts((currentPosts) => [{ ...createdPost, ...payload }, ...currentPosts]);
      }
      resetForm();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '保存 post 失败');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(post: Post) {
    const confirmed = window.confirm(`确认删除「${post.title}」吗？`);
    if (!confirmed) {
      return;
    }

    setError('');
    try {
      await deletePost(post.id);
      setPosts((currentPosts) => currentPosts.filter((item) => item.id !== post.id));
      if (editingId === post.id) {
        resetForm();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '删除 post 失败');
    }
  }

  async function updatePostScope(nextValue: boolean) {
    setShowOnlyMine(nextValue);
    resetForm();
    await refresh(nextValue);
  }

  return (
    <div className="app-shell">
      <Surface className="topbar" variant="default">
        <div className="topbar__brand">
          <Avatar color="accent" variant="soft">
            <Avatar.Fallback>{getInitials(session.user.name)}</Avatar.Fallback>
          </Avatar>
          <div>
            <p className="eyebrow">Posts</p>
            <h1>Placeholder Post 管理</h1>
          </div>
        </div>
        <div className="topbar__actions">
          <Surface className="profile-pill" variant="secondary">
            <Chip color="accent" variant="soft">
              {session.user.username}
            </Chip>
            <span>{session.user.email}</span>
          </Surface>
          <Button type="button" variant="outline" onPress={onLogout}>
            退出
          </Button>
        </div>
      </Surface>

      <main className="dashboard">
        <section className="summary-grid">
          <Surface className="summary-card" variant="secondary">
            <span>当前列表</span>
            <strong>{postStats.count}</strong>
            <small>{showOnlyMine ? '我的 Posts' : '全部 Posts'}</small>
          </Surface>
          <Surface className="summary-card" variant="secondary">
            <span>正文词数</span>
            <strong>{postStats.wordCount}</strong>
            <small>平均 {postStats.averageWords} 词 / 篇</small>
          </Surface>
          <Surface className="summary-card" variant="secondary">
            <span>编辑状态</span>
            <strong>{editingPost ? `#${editingPost.id}` : '新建'}</strong>
            <small>{editingPost ? editingPost.title : '准备创建新的 Post'}</small>
          </Surface>
        </section>

        <section className="content-grid">
          <Card className="editor-card" variant="tertiary">
            <Card.Header className="section-header">
              <div>
                <p className="eyebrow">Editor</p>
                <Card.Title>{editingPost ? '编辑 Post' : '新增 Post'}</Card.Title>
                <Card.Description>
                  {editingPost ? '正在调整已选文章内容。' : '创建后会立即插入当前列表顶部。'}
                </Card.Description>
              </div>
              {editingPost ? (
                <Chip color="warning" variant="soft">
                  编辑 #{editingPost.id}
                </Chip>
              ) : null}
            </Card.Header>
            <Separator variant="tertiary" />
            <Card.Content>
              <form className="stack" onSubmit={handleSubmit}>
                <Surface className="form-surface" variant="secondary">
                  <div className="field">
                    <Label htmlFor="post-title">标题</Label>
                    <Input
                      fullWidth
                      required
                      id="post-title"
                      placeholder="输入一个清晰的 Post 标题"
                      value={form.title}
                      variant="secondary"
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                    />
                  </div>
                  <div className="field">
                    <Label htmlFor="post-body">内容</Label>
                    <TextArea
                      fullWidth
                      required
                      id="post-body"
                      placeholder="写下正文内容..."
                      rows={8}
                      value={form.body}
                      variant="secondary"
                      onChange={(event) => setForm({ ...form, body: event.target.value })}
                    />
                  </div>
                </Surface>

                {error ? (
                  <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>操作失败</Alert.Title>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}

                <div className="form-actions">
                  <Button isDisabled={isSaving} type="submit" variant="primary">
                    {isSaving ? '保存中...' : editingId ? '保存修改' : '新增 Post'}
                  </Button>
                  {editingId ? (
                    <Button type="button" variant="secondary" onPress={resetForm}>
                      取消编辑
                    </Button>
                  ) : null}
                </div>
              </form>
            </Card.Content>
          </Card>

          <Card className="list-card">
            <Card.Header className="section-header list-header">
              <div>
                <p className="eyebrow">JSONPlaceholder</p>
                <Card.Title>Post 列表</Card.Title>
                <Card.Description>写操作会调用接口，并在当前页面更新结果。</Card.Description>
              </div>
              <Switch
                isDisabled={isLoading}
                isSelected={showOnlyMine}
                onChange={(nextValue) => void updatePostScope(nextValue)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  <Label>{showOnlyMine ? '只看我的' : '查看全部'}</Label>
                </Switch.Content>
              </Switch>
            </Card.Header>
            <Separator variant="tertiary" />
            <Card.Content>
              {isLoading ? (
                <Surface className="state-panel" variant="secondary">
                  <Spinner color="accent" size="sm" />
                  <span>正在加载 posts...</span>
                </Surface>
              ) : null}
              {!isLoading && posts.length === 0 ? (
                <Surface className="state-panel" variant="secondary">
                  <span>暂无 posts，试试新增一篇。</span>
                </Surface>
              ) : null}
              <div className="post-list">
                {posts.map((post) => (
                  <Card
                    className="post-card"
                    key={post.id}
                    variant={editingId === post.id ? 'tertiary' : 'secondary'}
                  >
                    <Card.Header className="post-card__header">
                      <div>
                        <div className="post-card__meta">
                          <Chip color="default" size="sm" variant="soft">
                            #{post.id}
                          </Chip>
                          <Chip color={post.userId === session.user.id ? 'accent' : 'default'} size="sm" variant="soft">
                            User {post.userId}
                          </Chip>
                        </div>
                        <Card.Title>{post.title}</Card.Title>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <p>{post.body}</p>
                    </Card.Content>
                    <Card.Footer className="row-actions">
                      <Button size="sm" type="button" variant="secondary" onPress={() => beginEdit(post)}>
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        variant="danger-soft"
                        onPress={() => void handleDelete(post)}
                      >
                        删除
                      </Button>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            </Card.Content>
          </Card>
        </section>
      </main>
    </div>
  );
}
