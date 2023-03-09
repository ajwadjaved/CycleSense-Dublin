import weatherapi
import requests
URL = "https://api.openweathermap.org/data/2.5/weather"

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
    print(data)
else:
    print("Error:", response.status_code)