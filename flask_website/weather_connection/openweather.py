import requests
from datetime import datetime
from DBConnector import DBConnector
import credentials

db_connector = DBConnector()

# start_time = datetime.datetime(2023, 3, 29, 0, 0, 0) # set the start time to 2023-03-29 at 00:00:00
today = datetime.today().strftime("%Y/%m/%d")
curr_time = datetime.now().strftime("%H:%M:%S")

# def get_time(start_time):
#     if start_time < datetime.datetime.now():
#         start_time += datetime.timedelta(seconds=5)
#         return start_time
#     return 0
    
def query_weatherAPI():
    output = []

    URL = "https://api.openweathermap.org/data/2.5/weather"
    # today = datetime.date.today().strftime("%Y/%m/%d")
    # curr_time = get_time(start_time)

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
        # print(data['main']['humidity'])
        description = data['weather'][0]['description']
        humidity = data['main']['humidity']
        temp = data['main']['temp']
        wind = data['wind'] #speed/degree
    else:
        print("Error:", response.status_code)

    output.append(today)
    output.append(curr_time)
    print(curr_time)
    output.append(description)
    output.append(temp)
    output.append(wind["speed"]) #wind speed
    output.append(wind["deg"]) #wind degrees
    output.append(humidity)
    print(output)
    
    return output

    # print(today)
    # print(description)
    # print(temp)


# print(query_weatherAPI())
db_connector.create_database()
db_connector.create_static_station_table()

# loop through and send new date one by one
today = datetime.today().strftime("%Y/%m/%d")
ref_date = "2023-03-01" #first of march, 2023
db_connector.insert_static_data(query_weatherAPI())
