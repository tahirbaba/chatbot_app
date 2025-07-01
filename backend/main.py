# backend/main.py

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import SessionLocal, init_db
from models import Chat

# ✅ Load .env
load_dotenv()

# ✅ Initialize DB
init_db()

# ✅ FastAPI App Instance
app = FastAPI()

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://chat-bot-frontend-zeta.vercel.app/",  # <-- your Vercel URL (replace if different)
        "*",  # for dev only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ OpenRouter Client
client = openai.OpenAI(
    api_key="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",
    base_url="https://openrouter.ai/api/v1"
)

# ✅ DB Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Chat Endpoint: send prompt, get AI response
@app.post("/chat")
async def chat_handler(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    prompt = data.get("prompt")
    user_id = data.get("user_id", "default-user")

    # Save user's message
    db.add(Chat(user_id=user_id, role="user", message=prompt))
    db.commit()

    # Get AI response
    response = client.chat.completions.create(
        model="mistralai/mistral-7b-instruct",
        messages=[{"role": "user", "content": prompt}]
    )
    ai_reply = response.choices[0].message.content

    # Save AI's reply
    db.add(Chat(user_id=user_id, role="assistant", message=ai_reply))
    db.commit()

    return {"response": ai_reply}

# ✅ Get Chat History
@app.get("/chats/{user_id}")
async def get_chats(user_id: str, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.timestamp).all()
    return [{"role": c.role, "message": c.message, "timestamp": c.timestamp} for c in chats]

# ✅ Save Chat Endpoint (used by frontend directly)
@app.post("/save-chat")
async def save_chat_handler(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    user_id = data.get("user_id")
    role = data.get("role")
    content = data.get("content")

    if not all([user_id, role, content]):
        return {"error": "Missing fields"}

    db.add(Chat(user_id=user_id, role=role, message=content))
    db.commit()

    return {"status": "saved"}
