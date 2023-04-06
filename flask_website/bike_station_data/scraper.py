import json
from datetime import datetime
from pathlib import Path

import requests

import dbinfo, credentials
from DBConnector import DBConnector


class BikeDataScraper:
    def __init__(self):
        self.db_connector = DBConnector()

    @staticmethod
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

    def insert_static(self):
        station_dicts = self.query_api()
        self.db_connector.insert_static_data(station_dicts)

    def insert_dynamic(self):
        # populate the dynamic table - schedule with cron;
        # log into cron.log (require full path because cron works from home directory)
        log = open(str(Path(__file__).resolve().parent) + "/cron.log", "a")
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        try:
            station_dicts = self.query_api()
            self.db_connector.insert_dynamic_data(station_dicts)
            log.write(timestamp + ": insert successful\n")
        except Exception as e:
            log.write(timestamp + ": " + str(e) + "\n")
        log.close()


scraper = BikeDataScraper()
scraper.insert_dynamic()
