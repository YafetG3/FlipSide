from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="FlipSide API", description="API for analyzing political news articles")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5183", "http://localhost:5176"],  # Allow both Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArticleRequest(BaseModel):
    url: str

class ArticleAnalysis(BaseModel):
    original_article: dict
    ai_analysis: dict
    counter_article: dict

@app.get("/")
async def root():
    return {"message": "Welcome to FlipSide API"}

@app.post("/analyze", response_model=ArticleAnalysis)
async def analyze_article(request: ArticleRequest):
    """
    Analyze a news article and return its content, AI analysis, and a counter-article.
    """
    try:
        # TODO: Implement article scraping
        # TODO: Implement AI analysis
        # TODO: Implement counter-article search
        
        # Placeholder response
        return {
            "original_article": {
                "title": "Sample Article",
                "content": "Sample content",
                "source": "example.com",
                "bias": "left"
            },
            "ai_analysis": {
                "summary": "Sample summary",
                "pros": ["Pro 1", "Pro 2", "Pro 3"],
                "cons": ["Con 1", "Con 2", "Con 3"]
            },
            "counter_article": {
                "title": "Counter Article",
                "content": "Counter content",
                "source": "counter-example.com",
                "bias": "right"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 