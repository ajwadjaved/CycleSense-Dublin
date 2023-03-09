import weatherapi
import requests
from datetime import date

URL = "https://api.openweathermap.org/data/2.5/weather"

today = date.today()
today = today.strftime("%d/%m/%Y")
print(today)

params = {
    "q": "Dublin,IE",
    "appid": weatherapi.API,
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

print(description)
print(temp)