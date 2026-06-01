import { apiFetch } from './client'

export async function fetchNews(country = 'vn', category = 'general') {
  return apiFetch<{ articles?: Record<string, string>[] }>(
    `/news?country=${country}&category=${category}`,
  )
}

/** Tin du lịch — NewsAPI everything (giống monolith) */
export async function fetchLatestNews(q = 'travel OR tourism OR destination') {
  return apiFetch<{ articles?: Record<string, unknown>[] }>(
    `/news/latest?q=${encodeURIComponent(q)}`,
  )
}

export async function sendChat(message: string) {
  const res = await apiFetch<{ reply?: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  const data = res.data as { reply?: string }
  return data?.reply ?? (res as unknown as { reply?: string }).reply ?? 'Không có phản hồi'
}
