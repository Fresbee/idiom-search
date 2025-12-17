from beanie import Document
import random
from typing import List
from pydantic import Field


class Idiom(Document):
    """
    Defines a record in the Idiom collection of the MongoDB database.
    """

    idiom: str
    definition: str
    synonyms: List[str] = []
    randomizerId: float = Field(default_factory=random.random)

    def __str__(self):
        return f"'{self.idiom}': {self.definition}"

    class Settings:
        name = "idioms"
        indexes = ["idioms", "randomizerId"]
