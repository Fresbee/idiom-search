from fastapi import APIRouter, Depends, status, HTTPException, Path, Query
import re
import random

from api.schemas.idiom import Idiom as IdiomSchema
from api.models.idiom import Idiom as IdiomModel
from api.auth.endpoint_dependencies import get_current_user
from api.models.user import User

router = APIRouter(prefix="/idioms", tags=["Searching"])

@router.get("/search/{search_phrase}",
         summary="Return all idioms that sufficiently match the provided phrase",
         description="The search phrase can be a partial or complete match to an idiom.",
         status_code=status.HTTP_200_OK,
         responses={status.HTTP_404_NOT_FOUND: {"description": "Idiom not found"}})
async def get_idiom(search_phrase: str = Path(description="partial or complete idiom to retrieve"),
                    limit: int = Query(10, ge=1, le=100, description="Maximum number of items to return"),
                    user: User = Depends(get_current_user)) -> list[IdiomSchema]:
    # Perform case-insensitive partial-text matching using a regex on the `idiom` field.
    # Escape the search phrase to avoid regex injection and limit results.
    regex = {"$regex": f".*{re.escape(search_phrase)}.*", "$options": "i"}
    cursor = IdiomModel.find_many({"idiom": regex})
    results = await cursor.to_list(length=limit)

    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idiom not found")

    return [IdiomSchema(idiom=document.idiom,
                        definition=document.definition,
                        synonyms=getattr(document, "synonyms", []) or []) for document in results]


@router.get("/random",
         summary="Return a random idiom from the collection",
         description="This is a fun way to learn a new figure of speech that you may not have known.",
         status_code=status.HTTP_200_OK,
         responses={status.HTTP_404_NOT_FOUND: {"description": "No idioms available"}})
async def get_random_idiom(user: User = Depends(get_current_user)) -> IdiomSchema:
    randomNumber = random.random()

    cursor = (IdiomModel.find_many(IdiomModel.randomizerId >= randomNumber).sort("randomizerId").limit(1))
    document = await cursor.to_list(length=1)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No idioms available")

    return IdiomSchema(
        idiom=document[0].idiom,
        definition=document[0].definition,
        synonyms=getattr(document, "synonyms", []) or [],
        example=getattr(document, "example", "Example usage not available.")
    )


@router.get("/by-letter/{starting_letter}",
         summary="Return all idioms that begin with a requested letter",
         description="Results will be returned in ascending alphabetical order.",
         status_code=status.HTTP_200_OK,
         responses={status.HTTP_404_NOT_FOUND: {"description": "Idiom not found"}})
async def get_idioms_starting_with_letter(starting_letter: str = Path(description="Single Latin character", regex="[A-Za-z]"),
                                          limit: int = Query(10, ge=1, le=100, description="Maximum number of items to return"),
                                          user: User = Depends(get_current_user)) -> list[IdiomSchema]:
    if len(starting_letter) > 1:
        raise HTTPException(status_code=400, detail="Query must be a single letter")
    
    # Perform case-insensitive partial-text matching using a regex on the `idiom` field.
    # Escape the search phrase to avoid regex injection and limit results.
    regex = {"$regex": f"^{re.escape(starting_letter)}.*", "$options": "i"}
    cursor = IdiomModel.find_many({"idiom": regex})
    results = await cursor.to_list(length=limit)

    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idiom not found")

    return [IdiomSchema(idiom=document.idiom,
                        definition=document.definition,
                        synonyms=getattr(document, "synonyms", []) or []) for document in results]


@router.get("/by-synonym/{synonym}",
         summary="Return all idioms that are synonyms with the requested word or phrase",
         description="This can help discover a colorful figure of speech for a literal word or phrase.",
         status_code=status.HTTP_200_OK,
         responses={status.HTTP_404_NOT_FOUND: {"description": "Idiom not found"}})
async def get_idioms_for_synonym(synonym: str = Path(description="word or phrase that means the same thing as potential idioms"),
                                 limit: int = Query(10, ge=1, le=100, description="Maximum number of items to return"),
                                 user: User = Depends(get_current_user)) -> list[IdiomSchema]:
    # Search by synonym field using case-insensitive regex matching
    regex = {"$regex": f".*{re.escape(synonym)}.*", "$options": "i"}
    cursor = IdiomModel.find_many({"synonyms": regex})
    results = await cursor.to_list(length=limit)

    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idiom not found")

    return [IdiomSchema(idiom=document.idiom,
                        definition=document.definition,
                        synonyms=getattr(document, "synonyms", []) or []) for document in results]
