const API_URL = import.meta.env.VITE_API_URL ?? 'https://jsonplaceholder.typicode.com';
const DEMO_PASSWORD = 'demo123';

export interface PlaceholderUser {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface Session {
  token: string;
  user: PlaceholderUser;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PostPayload {
  title: string;
  body: string;
  userId: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function login(identifier: string, password: string): Promise<Session> {
  if (password !== DEMO_PASSWORD) {
    throw new Error('演示密码应为 demo123');
  }

  const users = await request<PlaceholderUser[]>('/users');
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const user = users.find(
    (candidate) =>
      candidate.username.toLowerCase() === normalizedIdentifier ||
      candidate.email.toLowerCase() === normalizedIdentifier,
  );

  if (!user) {
    throw new Error('未找到匹配的 Placeholder 用户');
  }

  return {
    token: `placeholder-user-${user.id}`,
    user,
  };
}

export function listPosts(userId?: number) {
  const query = userId ? `?userId=${userId}` : '';
  return request<Post[]>(`/posts${query}`);
}

export function createPost(payload: PostPayload) {
  return request<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePost(id: number, payload: PostPayload) {
  return request<Post>(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deletePost(id: number) {
  return request<Record<string, never>>(`/posts/${id}`, {
    method: 'DELETE',
  });
}
