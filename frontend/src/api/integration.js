import { apiFetch } from "./client";
async function fetchNews(country = "vn", category = "general") {
  return apiFetch(
    `/news?country=${country}&category=${category}`
  );
}
async function fetchLatestNews(q = "travel OR tourism OR destination") {
  return apiFetch(
    `/news/latest?q=${encodeURIComponent(q)}`
  );
}
async function sendChat(message) {
  const res = await apiFetch("/chat", {
    method: "POST",
    body: JSON.stringify({ message })
  });
  const data = res.data;
  return data?.reply ?? res.reply ?? "Kh\xF4ng c\xF3 ph\u1EA3n h\u1ED3i";
}
export {
  fetchLatestNews,
  fetchNews,
  sendChat
};
