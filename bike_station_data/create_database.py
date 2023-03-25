# import class
from DBConnector import DBConnector

db_connector = DBConnector()

db_connector.create_database()
db_connector.create_static_station_table()
db_connector.create_dynamic_availability_table()
