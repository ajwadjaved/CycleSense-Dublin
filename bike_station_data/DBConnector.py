from bike_station_data import credentials, dbinfo
from sqlalchemy import create_engine, text
import datetime
import json


class DBConnector:
    # establish connection with amazon aws rds;
    # engine is meant to only be created once per application process
    # so it should be a class variable that has only one instance
    engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(
        credentials.DB_USER, credentials.DB_PW, dbinfo.DB_URI, dbinfo.DB_PORT,
        dbinfo.DB_NAME),
        echo=True)

    def create_database(self):
        # text() converts string to compatible sql command
        create_database = text("CREATE DATABASE IF NOT EXISTS dublin_bikes_db")
        # engine.begin() starts a transaction and auto-commits each sql command
        # "with" block would close the connection at the end automatically
        with self.engine.begin() as connection:
            connection.execute(create_database)

    def create_static_station_table(self):
        create_static_station_table = text("""
                CREATE TABLE IF NOT EXISTS station (
                    NUMBER INTEGER NOT NULL,
                    address VARCHAR(128),
                    banking BOOLEAN,
                    NAME VARCHAR(128),
                    position_lat FLOAT,
                    position_long FLOAT,
                    PRIMARY KEY (NUMBER)
                );
            """)
        with self.engine.begin() as connection:
            connection.execute(create_static_station_table)

    def create_dynamic_availability_table(self):
        create_dynamic_availability_table = text("""
                    CREATE TABLE IF NOT EXISTS availability (
                        NUMBER INTEGER NOT NULL,
                        last_update DATETIME NOT NULL,
                        open BOOLEAN,
                        bike_stands INTEGER,
                        available_bikes INTEGER,
                        available_bike_stands INTEGER,
                        PRIMARY KEY (NUMBER, last_update),
                        FOREIGN KEY (NUMBER) REFERENCES station(NUMBER)
                    );
                """)
        with self.engine.begin() as connection:
            connection.execute(create_dynamic_availability_table)

    def test_connection(self):
        check_column_types = text("""
                SELECT COLUMN_NAME, DATA_TYPE
                FROM information_schema.COLUMNS
                WHERE TABLE_NAME = 'station' OR TABLE_NAME = 'availability'
            """)
        with self.engine.begin() as connection:
            for column in connection.execute(check_column_types):
                print(column)

    def insert_static_data(self, stations):
        with self.engine.begin() as connection:
            for station in stations:
                insert_static = text("""
                    INSERT INTO station(NUMBER, address, banking, NAME, position_lat, position_long)
                    VALUES ({},'{}',{},'{}',{},{});
                                    """
                                     .format(station["number"], self.process_str(station["address"]),
                                             station["banking"],
                                             self.process_str(station["name"]), station["position"]["lat"],
                                             station["position"]["lng"])
                                     )
                connection.execute(insert_static)

    def insert_dynamic_data(self, stations):
        with self.engine.begin() as connection:
            for station in stations:
                # convert timestamp (int type in dictionary) from millisecond to second precision
                timestamp = datetime.datetime.fromtimestamp(station['last_update'] / 1000)
                is_open = True if station['status'] == 'OPEN' else False
                insert_dynamic = text("""
                    INSERT IGNORE INTO availability(NUMBER, last_update, open, 
                        bike_stands, available_bikes, available_bike_stands)
                    VALUES ({},'{}',{},{},{},{});
                                      """
                                      .format(station['number'], timestamp, is_open,
                                              station['bike_stands'], station['available_bikes'],
                                              station['available_bike_stands']
                                              )
                                      )
                connection.execute(insert_dynamic)

    @staticmethod
    def process_str(string):
        # 2 single quotes: first single quote escapes the second in a sql insert query
        return string.replace("'", "''")

    def return_hourly_station_data(self, station: int, duration_hours: int):
        with self.engine.begin() as connection:
            query = text("""
                    SELECT last_update, available_bikes, available_bike_stands
                    FROM availability
                    WHERE number = {}
                        AND last_update >= NOW() - INTERVAL {} HOUR;
                """.
                         format(station, duration_hours)
                         )
            rows = connection.execute(query).all()
        # key: update time; value: [avail_bikes, avail_stands]
        time_availability = dict()
        for row in rows:
            time_availability[row[0]] = {"available bikes": row[1],
                                         "available bike stands": row[2]}
        return time_availability

    def most_recent(self, station: int):
        with self.engine.begin() as connection:
            query = text("""
                SELECT *
                FROM availability
                WHERE NUMBER = {}
                  AND last_update = ANY (SELECT MAX(last_update)
                                         FROM availability
                                         WHERE NUMBER = {});
                """.format(station, station)
                         )
            # mappings().all() get all rows as an array of RowDictionary(column: value)
            rows = connection.execute(query).mappings().all()
        # get first RowDictionary, since the query would always return only 1 row
        row_dict = dict(rows[0])
        # default=str solves non-JSON-serializable columns, like datetime - converts it to string
        return json.dumps(row_dict, indent=4, default=str)

    def all_static_stations(self):
        with self.engine.begin() as connection:
            query = text("""
                SELECT NUMBER, address, position_lat, position_long
                FROM station;
            """)
            rows = connection.execute(query).mappings().all()
        trueDicts = []
        for row in rows:
            trueDicts.append(dict(row))
        return json.dumps(trueDicts, indent=4, default=str)

    def average_availability(self, station:int):
        with self.engine.begin() as connection:
            query = text("""
                SELECT AVG(available_bikes)
                FROM availability
                WHERE number = {};
            """.format(station))
        row = connection.execute(query).mappings().all()
        return json.dumps(row, indent=4, default=str)


# def tests():
#     connector = DBConnector()
#     print(connector.all_static_stations())


# tests()
