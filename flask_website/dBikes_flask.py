from flask import Flask, render_template
import json
from bike_station_data.DBConnector import DBConnector


app = Flask(__name__)


@app.route("/")
def home():
    # renders map.html template
    return render_template('map.html')


@app.route("/stations")
def stations():
    # returns static data of all stations
    f = open('static/locations.json')
    data = json.load(f)
    return data


@app.route("/availability/<int:station_id>")
def availability(station_id):
    # returns most recent data on bike availability at given station ----------- wip -----------
    # test on full internet connection - sqlalchemy.exc.OperationalError: can't connect (timed out)
    d = DBConnector()
    a = DBConnector.most_recent(d, station_id)
    return a


@app.route("/weather/<int:station_id>")
def getWeather(station_id):
    # returns dynamic weather data for specific station --------- wip ---------
    pass


if __name__ == '__main__':
    app.run(debug=True)
