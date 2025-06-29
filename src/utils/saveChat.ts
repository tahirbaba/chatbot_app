// src/utils/saveChat.ts

export async function saveChat(userId: string, role: string, message: string) {
  await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, role, message }),
  });
}
