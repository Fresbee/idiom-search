#!/usr/bin/env python3

import asyncio
from pymongo import AsyncMongoClient
from beanie import init_beanie
from beanie.odm.operators.update.general import Set
from pathlib import Path
import pandas as pd
import random

from core.config import settings
from models.idiom import Idiom

def extract_dataframe(input_file: str):
    """
    Parses a provided tab-separated values file containing
    idioms input data and returns a Pandas dataframe.
    
    :param input_file: Path to a tab-separated values (.tsv) file
    """
    
    raw_data_frame = pd.read_csv(input_file, sep='\t', dtype=str)
    raw_data_frame['Idiom'] = raw_data_frame['Idiom'].str.lower()

    # Format synonyms into List of separate strings from comma-separated string
    raw_data_frame['Synonyms'] = raw_data_frame['Synonyms'].apply(
        lambda x: [i.strip() for i in x.split(",")] if isinstance(x, str) and x else []
    )

    raw_data_frame['Synonyms'] = raw_data_frame['Synonyms'].apply(
        lambda lst: [x for x in lst if x] if isinstance(lst, list) else lst
    )

    return raw_data_frame

async def populate_database(mongodb_connection_string: str, dataframe: pd.DataFrame):
    """
    Upsert Idiom record entries from a provided Pandas dataframe
    into a Mongo DB database. New entries are inserted if they do
    not exist and existing idioms have their other fields updated.
    
    :param mongodb_connection_string: a connection string to the target MongoDB database
    :param dataframe: Pandas dataframe containing information for idiom updates
    """

    print("Connecting to mongo DB instance...")
    async with AsyncMongoClient(mongodb_connection_string) as client:
        target_database = client.get_database(settings.mongodb_db)
        await init_beanie(database=target_database, document_models=[Idiom])

        # Upsert each document per row in the data frame
        print("Inserting records into collection...")
        for index, row in dataframe.iterrows():
            row_as_dictionary = row.to_dict()

            new_idiom = Idiom(idiom=row_as_dictionary["Idiom"],
                            definition=row_as_dictionary["Definition"],
                            synonyms=row_as_dictionary["Synonyms"],
                            randomizerId=random.random())
            await Idiom.find_one(Idiom.idiom == new_idiom.idiom).upsert(
                Set({
                        "definition": new_idiom.definition,
                        "synonyms": new_idiom.synonyms,
                        "randomizerId": new_idiom.randomizerId
                    }),
                on_insert=new_idiom
            ) # type: ignore

        stored_idiom_entries = await Idiom.find_all().to_list()
        for current_idiom in stored_idiom_entries:
            print(current_idiom.randomizerId, current_idiom.idiom)


def main():
    print("Load .csv file into data frame...")
    script_base_dir = Path(__file__).resolve().parent
    path_to_input_data = script_base_dir / "idioms-master-list.tsv"
    print("Input data path:", path_to_input_data)
    processed_dataframe = extract_dataframe(str(path_to_input_data))

    print("Ingest data frame into NoSQL database...")
    asyncio.run(populate_database(settings.mongo_database_connection_uri, processed_dataframe))
    print("Database updates completed")

if __name__ == "__main__":
    main()
