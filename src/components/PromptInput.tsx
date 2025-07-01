"use client";

import { useState } from "react";
import { saveChat } from "@/utils/saveChat";

const userId = "tahir123";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [chatPairs, setChatPairs] = useState<
    { prompt: string; response: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    const userMsg = prompt;
    await saveChat(userId, "user", userMsg);

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMsg, user_id: userId }),
    });

    const data = await res.json();
    const aiReply = data.response;
    await saveChat(userId, "assistant", aiReply);

    setChatPairs((prev) => [...prev, { prompt: userMsg, response: aiReply }]);
    setPrompt("");
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#111111] text-white px-6 py-10 font-mono space-y-8">
      {/* Title */}
      <h1 className="text-4xl text-center font-bold text-teal-400 tracking-wider">
        ⚡️ TahirGPT
      </h1>

      {/* Chat Section */}
      <div className="rounded-3xl p-6 bg-black/40 border border-gray-800 shadow-[0_0_20px_#00f2ff30] backdrop-blur-md max-h-[60vh] overflow-y-auto space-y-6">
        {chatPairs.map((pair, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-gradient-to-br from-purple-700 to-indigo-700 text-white px-4 py-3 rounded-2xl shadow-lg">
                <span className="text-xs block text-purple-200">You</span>
                {pair.prompt}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gradient-to-br from-[#222222] to-[#333333] text-green-300 px-4 py-3 rounded-2xl border border-green-500/30 shadow-lg">
                <span className="text-xs block text-green-400">AI</span>
                {pair.response}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center text-sm text-cyan-400 animate-pulse">
            <span className="text-lg">🤖</span> AI is thinking...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="> Enter your command"
          className="flex-grow px-5 py-3 bg-black text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner placeholder:text-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          ⚡ Send
        </button>
        <button
          onClick={() => setChatPairs([])}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl shadow-lg transition"
        >
          🔁 Reset
        </button>
      </div>

      {/* New Chat Button */}
      <div className="text-right pt-2">
        <button
          onClick={() => setChatPairs([])}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          + Start New Chat
        </button>
      </div>
    </div>
  );
}
