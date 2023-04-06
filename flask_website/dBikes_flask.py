from flask import Flask, render_template, jsonify
import json
from datetime import datetime

from flask_website.bike_station_data.DBConnector import DBConnector

app = Flask(__name__)


@app.route("/")
def home():
    f = open("static/locations.json")
    data = json.load(f)
    for d in data:
        i = d['address']
        return render_template('map.html', data=i)


@app.route("/stations")
def stations():
    # returns static data of all stations
    f = open('static/locations.json')
    data = json.load(f)
    return data


@app.route("/station/<int:station_id>")
def station(station_id):
    # returns dynamic occupancy data for specific station ----------- wip -----------
    today = datetime.now()
    hour = today.hour
    # --------- create DBConnector object ----------
    d = DBConnector
# ------call function which returns most recent entry on availability from database at given station ---------
#     w = DBConnector.return_hourly_station_data(d, station_id, hour)
#     return jsonify(w)


@app.route("/weather/<int:station_id>")
def getWeather(station_id):
    # returns dynamic weather data for specific station --------- wip ---------
    pass


if __name__ == '__main__':
    app.run(debug=True)
