
import os
import json
import logging
from typing import Set, Any, Dict

logging.basicConfig(level=logging.INFO)
log = logging.getLogger()
log.setLevel(os.getenv('LOG_LEVEL', logging.INFO))

default_value = 'NOTFOUND'

def get_dict_value(dictionary: dict, key: str, nullable:bool = False):
    val = dictionary.get(key, default_value)
    if not nullable and val == default_value:
        raise Exception(f"Key: {key} not found in {dictionary}")
    
    log.info(f"Got parameter: {key}:{val}")

    return val

def parseLambdaIterationOutput(event: dict)->Dict[str,Any]:
    processedRecords: int = event.get('processedRecords', 0)
    startTimeinIso: str = event.get('startTimeinIso', "")
    endTimeinIso: str = event.get('endTimeinIso', "")

    return   {
        "processedRecords": processedRecords,
        "startTimeinIso": startTimeinIso,
        "endTimeinIso": endTimeinIso,
    }



def handler(outputList, ctx):
    processedRecords: int = 0
    startTimeinIso: Set[str] = set()
    endTimeinIso: Set[str] = set()
    
    for event in outputList:

        resp = parseLambdaIterationOutput(event)
        
        processedRecords += resp.get("processedRecords", 0)
        startTimeinIso.add(resp.get('startTimeinIso', ""))
        endTimeinIso  .add(resp.get('endTimeinIso',   ""))


    return   {
        "processedRecords": processedRecords,
        "startTimeinIso": min(list(startTimeinIso)),
        "endTimeinIso": max(list(endTimeinIso)),
        }

# Test from local machine
if __name__ == '__main__':
    event=[
        {
            "processedRecords": 122,
            "startTimeinIso": "2021-01-01T00:03:34",
            "endTimeinIso": "2021-01-01T00:13:34"
        },
        {
            "processedRecords": 389,
            "startTimeinIso": "2021-01-01T00:03:34",
            "endTimeinIso": "2021-01-01T00:13:34"
        },
        {
            "processedRecords": 221,
            "startTimeinIso": "2021-01-01T00:03:34",
            "endTimeinIso": "2021-01-01T00:13:34"
        }
    ]
    result = handler(event,None)
    log.info(f'result = {json.dumps(result, indent=2)}')
