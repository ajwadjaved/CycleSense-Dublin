# importing all relevant modules:
import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
from pprint import pprint
import simplejson as json
import request
import time
from IPython.display import display

# setting variable names for use in request --> fill in correct info for database connection
URI = 'xxx'
PORT = 'xxx'
DB = 'xxx'
PASSWORD = 'xxx'
USER = 'xxx'

# setting variable names for sql code:
engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

# creating database in mySQL: dbbikes:
sql = """CREATE DATABASE IF NOT EXISTS dbbikes"""
engine.execute(sql)

# creating tables in mySQL database:
# Table: stations --> static data:
sql = """
CREATE TABLE IF NOT EXISTS station (
    address VARCHAR(265),
    banking INTEGER,
    bike_stands INTEGER,
    bonus INTEGER,
    contract_name VARCHAR(256),
    name VARCHAR(256),
    position_lat REAL,
    position_lng REAL,
    status VARCHAR(256),
    )
"""
try:
    res = engine.execute("DROP TABLE IF EXISTS station")
    res = engine.execute(sql)
    print(res.fetchall())
except Exception as e:
    print(e)

# Table: availability --> dynamic data:
sql = """
CREATE TABLE IF NOT EXISTS availability (
    number INTEGER;
    available_bikes INTEGER,
    available_bike_stands INTEGER,
    last_update INTEGER
    )
    """
try:
    res = engine.execute(sql)
    print(res.fetchall())
except Exception as e:
    print(e)