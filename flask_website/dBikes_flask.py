from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template('map.html')


@app.route('/stations')
def get_stations():
    pass


if __name__ == '__main__':
    app.run(debug=True)
