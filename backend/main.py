from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    mode: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Dummy logic to handle requests from the frontend using RAG logic placeholders
    message_lower = request.message.lower()
    
    if request.mode == 'solar':
        if "lokasi" in message_lower or "terbaik" in message_lower:
            reply = "Berdasarkan data iradiasi NASA POWER, atap merah di sisi barat memiliki potensi penghematan Rp 1.5 Juta/bulan."
        else:
            reply = "Sistem Solar Heatmap aktif. Gedung yang menyala merah paling optimal untuk PV. (Mode: Solar)"
            
    elif request.mode == 'ev':
        if "kosong" in message_lower or "antrean" in message_lower:
            reply = "Berdasarkan analisis M/M/s, SPKLU hijau di perumahan kosong antrean sekarang. Bauran energinya 45% surya."
        else:
            reply = "Sistem routing pintar EV siap. Mobil yang menyala dialihkan secara dinamis. (Mode: EV)"
            
    elif request.mode == 'policy':
        if "emisi" in message_lower or "bus" in message_lower:
            reply = "Jalur bus ungu mengurangi emisi total kawasan hingga 8% dan memangkas waktu tempuh 15 menit/perjalanan."
        else:
            reply = "Ontology Simulator aktif. Simulasi tidak melanggar tata ruang lokal. (Mode: Policy)"
            
    else:
        reply = f"Halo, simulasi untuk {request.mode} masih dikembangkan."
        
    return {"reply": reply}

@app.get("/api/health")
async def health():
    return {"status": "ok"}
