from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.models import models  # wir erstellen das gleich

# Falls Models registriert sind, Datenbanktabellen erstellen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CraftHub API")

# CORS aktivieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # später sicherer machen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CraftHub API!"}

@app.get("/test")
def read_test():
    return {"status": "ok", "info": "CraftHub backend läuft!"}