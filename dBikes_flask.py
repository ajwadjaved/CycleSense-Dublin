from flask import Flask, render_template
from bike_station_data.DBConnector import DBConnector as BikesData
from weather_connection.DBConnector import DBConnector as WeatherData
from prediction import Prediction
from datetime import datetime

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


@app.route("/prediction/<int:station_id>/<date>")
def get_predictions(station_id, date):
    # convert date to string type, then to datetime.date type
    # date expected format: 2023-02-28
    date = datetime.strptime(str(date), '%Y-%m-%d')
    pred = Prediction()
    # the returned type is a json - array of objects, each array element is the prediction for that hour
    return pred.make_prediction(station_id, date)


@app.route("/weather")
def get_weather():
    # returns dynamic weather data for specific station - current weather
    connector = WeatherData()
    station_info = connector.most_recent()
    return station_info


if __name__ == '__main__':
    app.run(debug=True)
