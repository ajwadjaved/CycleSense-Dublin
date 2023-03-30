import requests
from datetime import datetime

from DBConnector import DBConnector
import credentials

db_connector = DBConnector()


def query_weatherAPI():
    output = []

    URL = "https://api.openweathermap.org/data/2.5/weather"
    today = datetime.today().strftime("%Y/%m/%d")
    curr_time = datetime.now().strftime("%H:%M:%S")

    params = {
        "q": "Dublin,IE",
        "appid": credentials.WEATHER_API_KEY,
        "units": "metric"
    }

    # Make the API request
    response = requests.get(URL, params=params)

    # Check if the request was successful
    if response.status_code == 200:
        # Extract the weather data from the JSON response
        data = response.json()
        description = data['weather'][0]['description']
        temp = data['main']['temp']
    else:
        print("Error:", response.status_code)

    output.append(today)
    output.append(curr_time)
    print(curr_time)
    output.append(description)
    output.append(temp)
    # print(output)
    return output

    # print(today)
    # print(description)
    # print(temp)


# print(query_weatherAPI())
# db_connector.create_database()
# db_connector.create_static_station_table()
db_connector.insert_static_data(query_weatherAPI())

