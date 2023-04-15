import json
import pickle
import time
from datetime import datetime
from datetime import timedelta

import requests

import pandas

# run this .py from /flast_website
import credentials


class Prediction:
    def make_prediction(self, station: int, requested_date: datetime.date):
        weather_forecast = self.weather_forecast(requested_date)
        # load forecast into data frame
        feature_df = pandas.DataFrame(weather_forecast)
        # add station as first column to the dataframe
        feature_df.insert(loc=0, column="NUMBER", value=station)
        with open("model/model_" + str(station) + ".pkl", 'rb') as file:
            model = pickle.load(file)

        # print(feature_df)
        pred_array = model.predict(feature_df)
        pred_df = pandas.DataFrame(pred_array, columns=['available_bikes', 'available_bike_stands'])
        hour_column = feature_df['timehours_weather']
        pred_df.insert(loc=0, column="hour", value=hour_column)
        return pred_df.to_json(orient='records', indent=4)

    @staticmethod
    def weather_forecast(requested_date: datetime.date):
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "q": "Dublin, IE",
            "appid": credentials.WEATHER_API_KEY,
            "unit": "metric"
        }
        response = requests.get(url, params=params)
        weather_forecast_dict = json.loads(response.text)
        # convert time from UTC to dublin local
        for forecast in weather_forecast_dict["list"]:
            now_timestamp = time.time()
            offset_from_utc = datetime.fromtimestamp(now_timestamp) - datetime.utcfromtimestamp(now_timestamp)
            forecast_utc_time = datetime.fromtimestamp(forecast["dt"])
            forecast["dublin_time"] = forecast_utc_time + offset_from_utc
        # check format
        # with open("forecast.json", "w") as outfile:
        #     json.dump(weather_forecast_dict, outfile, indent=4, default=str)

        # return only relevant info
        output = list()
        for forecast in weather_forecast_dict["list"]:
            forecast_time = forecast["dublin_time"]
            # only need forecast for requested date
            if forecast_time.date() == requested_date:
                forecast_hour = forecast_time.hour
                output_forecast = dict()
                # populate forecast with required weather attributes
                # match the keys to model column names when fitting the model
                output_forecast["timehours_weather"] = forecast_hour
                output_forecast["temp"] = forecast["main"]["temp"]
                output_forecast["humidity"] = forecast["main"]["humidity"]
                output_forecast["speed"] = forecast["wind"]["speed"]
                output_forecast["degrees"] = forecast["wind"]["deg"]
                output_forecast["wID"] = forecast["weather"][0]["id"]
                output.append(output_forecast)
        return output


def forecast_test():
    pred = Prediction()
    tomorrow = datetime.today() + timedelta(days=1)
    forecast_output = pred.weather_forecast(tomorrow.date())

    # check output
    with open("forecast_output.json", "w") as outfile:
        json.dump(forecast_output, outfile, indent=4, default=str)


def prediction_test():
    pred = Prediction()
    tomorrow = datetime.today() + timedelta(days=1)
    tomorrow = tomorrow.date()
    print(pred.make_prediction(117, tomorrow))


# forecast_test()
prediction_test()
