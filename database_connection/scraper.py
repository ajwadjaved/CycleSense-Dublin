import requests
import json
from datetime import datetime

import dbinfo
import credentials
from DBConnector import DBConnector

db_connector = DBConnector()


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


def insert_static():
    station_dicts = query_api()
    db_connector.insert_static_data(station_dicts)


# insert_static()
# populate the dynamic table - schedule with cron; log into cron.log
log = open("cron.log", "a")
timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
try:
    station_dicts = query_api()
    db_connector.insert_dynamic_data(station_dicts)
    log.write(timestamp + ": insert successful")
except Exception as e:
    log.write(timestamp + str(e))
log.close()
