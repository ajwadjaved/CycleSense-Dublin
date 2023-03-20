SELECT COLUMN_NAME, DATA_TYPE, TABLE_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'test'
  AND TABLE_NAME = 'availability';

INSERT INTO station(NUMBER, address, banking, NAME, position_lat, position_long)
VALUES (1, 'test', FALSE, 'o''connel', 12.2, 9501.2);

DELETE
FROM station
WHERE TRUE;

SELECT COUNT(*)
FROM station;

INSERT IGNORE INTO availability(NUMBER, last_update, open, bike_stands, available_bikes, available_bike_stands)
VALUES (42, '2023-03-04 01:40:52', FALSE, 30, 12, 18);

SELECT COUNT(*)
FROM availability;


