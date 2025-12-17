from fastapi import FastAPI, HTTPException, status
from contextlib import asynccontextmanager

from api.core.database import init_db, close_db
from api.endpoints.analysis import router as analysis_router
from api.endpoints.idiom_search import router as idiom_search_router
from api.models.idiom import Idiom as IdiomModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database connection...", flush=True)
    await init_db()
    print("Database connection initialized", flush=True)
    yield
    print("Closing database connection...", flush=True)
    await close_db()
    print("Database connection closed", flush=True)


api_description = "The English language has a rich tradition of expressions. " \
"It can be challenging for native or newer English speakers to understand some idioms. " \
"This API is here to demystify some of them and easily find the right phrase when you need it."

app = FastAPI(title="The Idioms API",
              summary="Discover colorful figures of speech and what they mean.",
              description=api_description,
              version="0.1.0",
              lifespan=lifespan)

@app.get("/healthcheck",
         summary="Healthcheck endpoint to verify API is running",
         description="A simple endpoint to verify that the API is running and responsive.",
         tags=["Healthcheck"],
         status_code=status.HTTP_200_OK,
         responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Database service not available"}})
async def health_check() -> dict:
    try:
        # Perform a very small query to ensure relevant DB models and Beanie are ready.
        # This will raise an exception if Beanie wasn't properly initialized.
        doc = await IdiomModel.find_one({})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Beanie query failed: {e}")

    return {"status": "ready", "db_connected": True, "db_sample_exists": bool(doc)}


app.include_router(idiom_search_router)
app.include_router(analysis_router)
