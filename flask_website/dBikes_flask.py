from flask import Flask, render_template
import json

app = Flask(__name__)


@app.route("/")
def home():
    f = open("../flask_website/static/locations.json")
    data = json.load(f)
    for d in data:
        i = d['address']
        return render_template('map.html', data=i)


@app.route("/station/<int:station_id>")
def station(station_id):
    f = open('../flask_website/static/locations.json')
    data = json.load(f)
    for s in data:
        if s['number'] == station_id:
            info = 'Name: '+s['address']+' \nNumber: '+str(s['number'])+'Latitude: '+str(s['latitude'])+'\nLongitude: '+str(s['longitude'])
            return render_template("map.html", info=info)


if __name__ == '__main__':
    app.run(debug=True)
