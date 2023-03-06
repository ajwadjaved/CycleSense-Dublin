import time
import requests
import json

import dbinfo
import credentials
from DBConnector import DBConnector


def query_api():
    dublin_stations = requests.get(dbinfo.STATIONS_LIST_URI,
                                   params={"apiKey": credentials.API_KEY,
                                           "contract": dbinfo.CONTRACT_NAME})
    # creates a python list<dictionary> object out of the text returned from the API
    stations_dicts = json.loads(dublin_stations.text)
    return stations_dicts
    # convert dictionary into JSON format text and inspect in output JSON file
    # with open("bike_data.json", "w") as outfile:
    #     json.dump(stations_dict, outfile, indent=4)


# todo: switch from test database to prod database
test = False
db_connector = DBConnector()
station_dicts = query_api()

# populate the static table
db_connector.insert_static_data(station_dicts, test)

# populate the dynamic table
while True:
    try:
        station_dicts = query_api()
        db_connector.insert_dynamic_data(station_dicts, test)
        # rest 5 minutes
        time.sleep(5 * 60)
    except Exception as e:
        print(e)
