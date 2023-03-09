import dbinfo
import requests
import json



STATIONS_URL = "https://api.jcdecaux.com/vls/v1/stations"


r = requests.get(STATIONS_URL, params={"apiKey": dbinfo.JCKEY, "contract": dbinfo.NAME})
# json.loads(r.text)
# print(r.text)
print(json.loads(r.text))