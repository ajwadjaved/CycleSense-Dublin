# to enable importing (dbinfo & credentials) from the parent folder (dublinbikesproject)
import json
import sys

sys.path.append('..')
import credentials
import dbinfo
from sqlalchemy import create_engine, text


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
        create_database = text("CREATE DATABASE IF NOT EXISTS historical_weather")
        # engine.begin() starts a transaction and auto-commits each sql command
        # "with" block would close the connection at the end automatically
        with self.engine.begin() as connection:
            connection.execute(create_database)

    def create_static_station_table(self):
        create_static_station_table = text("""
                CREATE TABLE IF NOT EXISTS historical_weather (
                    date DATE,
                    time TIME,
                    weather VARCHAR(128),
                    temp FLOAT,
                    speed FLOAT,
                    degrees INT,
                    humidity INT,
                    PRIMARY KEY (date,time)
                );
            """)
        with self.engine.begin() as connection:
            connection.execute(create_static_station_table)

    # def create_dynamic_availability_table(self):
    #     create_dynamic_availability_table = text("""
    #             CREATE TABLE IF NOT EXISTS weather (
    #                 date DATE,
    #                 weather VARCHAR(128),
    #                 degrees FLOAT,
    #                 PRIMARY KEY (NUMBER)
    #             );
    #             """)
    #     with self.engine.begin() as connection:
    #         connection.execute(create_dynamic_availability_table)

    def test_connection(self):
        check_column_types = text("""
                SELECT COLUMN_NAME, DATA_TYPE
                FROM information_schema.COLUMNS
                WHERE TABLE_NAME = 'historical_weather'
            """)
        with self.engine.begin() as connection:
            for column in connection.execute(check_column_types):
                print(column)

    def insert_static_data(self, weatherdata):
        print(weatherdata)
        with self.engine.begin() as connection:
            insert_static = text("""
                INSERT INTO historical_weather(date, time, weather, temp, speed, degrees, humidity)     
                VALUES ('{}','{}','{}',{}, {}, {}, {});
                                """
                                 .format(weatherdata[0],
                                         weatherdata[1],
                                         weatherdata[2],
                                         weatherdata[3],
                                         weatherdata[4],
                                         weatherdata[5],
                                         weatherdata[6])
                                 )
            connection.execute(insert_static)

    def most_recent(self):
        with self.engine.begin() as connection:
            query = text("""
                SELECT *
                FROM historical_weather
                WHERE date = CURDATE()
                    AND time = ANY (SELECT MAX(time)
                                    FROM historical_weather
                                    WHERE date = CURDATE());
            """)
            rows = connection.execute(query).mappings().all()
        row_dict = dict(rows[0])
        return json.dumps(row_dict, indent=4, default=str)

    @staticmethod
    def process_str(string):
        # 2 single quotes: first single quote escapes the second in a sql insert query
        return string.replace("'", "''")


def test():
    connector = DBConnector()
    print(connector.most_recent())


test()