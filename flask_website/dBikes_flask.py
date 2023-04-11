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
    # get most recent bike info for given station
    d = DBConnector()
    s = d.most_recent(station_id)
    return s


@app.route("/weather/<int:station_id>")
def get_weather(station_id):
    # returns dynamic weather data for specific station --------- wip ---------
    pass


if __name__ == '__main__':
    app.run(debug=True)
