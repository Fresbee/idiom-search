from pydantic import BaseModel, Field

class Idiom(BaseModel):
    idiom: str = Field(description="a figure of speech", examples=["skating on thin ice"])
    definition: str = Field(description="definition for the idiom or literal equivalent meaning", examples=["to proceed with risky behavior"])
    synonyms: list[str] = Field(description="synonyms for the figure of speech", examples=['risk-taking', 'in danger'])
    example: str = Field(description="using the idiom in a sentence, showing an example of properly using it", default="Example usage not available.", examples=["Jason was skating on thin ice after the teacher caught him cheating on the test."])

    class Config:
        json_schema_extra = {
            "description": "An Idiom represents a figure of speech along with its definition."
        }
