import credentials
import dbinfo

import requests
import json

dublin_stations = requests.get(dbinfo.STATIONS_LIST_URI,
                               params={"apiKey": credentials.API_KEY,
                                       "contract": dbinfo.CONTRACT_NAME})

# creates a python dictionary object out of the text returned from the API
stations_dict = json.loads(dublin_stations.text)
# convert dictionary into JSON format text
json_text = json.dumps(stations_dict, indent=2)
# test output
print(json_text)
