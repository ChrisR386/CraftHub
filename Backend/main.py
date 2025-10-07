from fastapi import FastAPI

app = FastAPI(title="CraftHub API", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Welcome to CraftHub API!"}

@app.get("/projects")
def get_projects():
    return [
        {"id": 1, "title": "Lasergravur-Projekt", "status": "in_progress"},
        {"id": 2, "title": "Halsband-Kollektion", "status": "completed"}
    ]