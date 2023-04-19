from flask import Flask, render_template
from bike_station_data.DBConnector import DBConnector as BikesData
from weather_connection.DBConnector import DBConnector as WeatherData

app = Flask(__name__)


@app.route("/")
def home():
    # renders map.html template
    return render_template('map.html')


@app.route("/stations")
def stations():
    # returns static data of all stations
    connector = BikesData()
    all_stations = connector.all_static_stations()
    return all_stations


@app.route("/availability/<int:station_id>")
def availability(station_id):
    # get most recent bike info for given station - availability
    connector = BikesData()
    station_info = connector.most_recent(station_id)
    return station_info


@app.route("/weather")
def get_weather():
    # returns dynamic weather data for specific station - current weather
    connector = WeatherData()
    station_info = connector.most_recent()
    return station_info


if __name__ == '__main__':
    app.run(debug=True)
