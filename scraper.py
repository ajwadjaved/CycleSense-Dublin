import requests
import json

import dbinfo
import credentials
from DBConnector import DBConnector

dublin_stations = requests.get(dbinfo.STATIONS_LIST_URI,
                               params={"apiKey": credentials.API_KEY,
                                       "contract": dbinfo.CONTRACT_NAME})
# creates a python list<dictionary> object out of the text returned from the API
stations_dicts = json.loads(dublin_stations.text)
# convert dictionary into JSON format text and inspect in output JSON file
# with open("bike_data.json", "w") as outfile:
#     json.dump(stations_dict, outfile, indent=4)

# todo: switch from test database to prod database
test = True

# populate the static table
db_connector = DBConnector()
db_connector.insert_static_data(stations_dicts, test)

# populate the dynamic table
