# import class
from DBConnector import DBConnector

db_connector = DBConnector()

#todo: switch from test to prod database
test = False
db_connector.create_database(test)
db_connector.create_static_station_table(test)
db_connector.create_dynamic_availability_table(test)
db_connector.test_connection(test)
