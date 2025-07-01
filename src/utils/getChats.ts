// src/utils/getChats.ts

export async function getChats(userId: string) {
  const res = await fetch(`http://127.0.0.1:8000/chats/${userId}`);
  return await res.json();
}