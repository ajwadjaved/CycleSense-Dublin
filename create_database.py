# importing
import credentials
import dbinfo

import sqlalchemy as sqla
from sqlalchemy import \
    create_engine, text, MetaData, Table, Column, \
    Integer, String, Boolean, Float, DateTime, ForeignKey

# establish connection with amazon aws rds
engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(
    credentials.DB_USER, credentials.DB_PW, dbinfo.DB_URI, dbinfo.DB_PORT, dbinfo.DB_NAME),
    echo=True)  # log all statements

with engine.begin() as connection:
    # text() converts string to compatible sql command
    create_database = text("CREATE DATABASE IF NOT EXISTS dublinbikes")
    create_static_station_table = text("""
        CREATE TABLE IF NOT EXISTS station (
            number INTEGER NOT NULL,
            address VARCHAR(128),
            banking BOOLEAN,
            NAME VARCHAR(128),
            position_lat FLOAT,
            position_long FLOAT,
            PRIMARY KEY (NUMBER)
        );
    """)
    create_dynamic_availability_table = text("""
        CREATE TABLE IF NOT EXISTS availability (
            number INTEGER NOT NULL,
            last_update DATETIME NOT NULL,
            status BOOLEAN,
            bike_stands INTEGER,
            available_bikes INTEGER,
            available_bike_stands INTEGER,
            PRIMARY KEY (number, last_update),
            FOREIGN KEY (number) REFERENCES station(number)
        );
    """)
    connection.execute(create_database)
    connection.execute(create_static_station_table)
    connection.execute(create_dynamic_availability_table)
    connection.commit()
