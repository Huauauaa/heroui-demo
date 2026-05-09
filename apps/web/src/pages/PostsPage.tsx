import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
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

  async function togglePostScope() {
    const nextValue = !showOnlyMine;
    setShowOnlyMine(nextValue);
    resetForm();
    await refresh(nextValue);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Posts</p>
          <h1>Placeholder Post 管理</h1>
        </div>
        <div className="topbar__actions">
          <Chip color="accent" variant="soft">
            {session.user.name}
          </Chip>
          <Button type="button" variant="outline" onPress={onLogout}>
            退出
          </Button>
        </div>
      </header>

      <main className="content-grid">
        <Card>
          <Card.Header className="section-header">
            <div>
              <p className="eyebrow">Editor</p>
              <h2>{editingPost ? '编辑 Post' : '新增 Post'}</h2>
            </div>
          </Card.Header>
          <Card.Content>
            <form className="stack" onSubmit={handleSubmit}>
              <label className="field">
                <span>标题</span>
                <Input
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <label className="field">
                <span>内容</span>
                <TextArea
                  required
                  rows={8}
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                />
              </label>
              {error ? <p className="error-text">{error}</p> : null}
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

        <Card>
          <Card.Header className="section-header list-header">
            <div>
              <p className="eyebrow">JSONPlaceholder</p>
              <h2>Post 列表</h2>
              <p className="muted">写操作会调用接口，并在当前页面更新结果。</p>
            </div>
            <Button
              isDisabled={isLoading}
              type="button"
              variant="tertiary"
              onPress={() => void togglePostScope()}
            >
              {showOnlyMine ? '查看全部' : '只看我的'}
            </Button>
          </Card.Header>
          <Card.Content>
            {isLoading ? <p className="muted">加载中...</p> : null}
            {!isLoading && posts.length === 0 ? <p className="muted">暂无 posts</p> : null}
            <div className="post-list">
              {posts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div>
                    <div className="post-card__meta">
                      <Chip color="default" size="sm" variant="soft">
                        #{post.id}
                      </Chip>
                      <span>User {post.userId}</span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </div>
                  <div className="row-actions">
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
                  </div>
                </article>
              ))}
            </div>
          </Card.Content>
        </Card>
      </main>
    </div>
  );
}
