SELECT COLUMN_NAME, DATA_TYPE, TABLE_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'test'
  AND (TABLE_NAME = 'station' OR TABLE_NAME = 'availability');

INSERT INTO test.station(NUMBER, address, banking, NAME, position_lat, position_long)
VALUES (1, 'test', FALSE, 'o''connel', 12.2, 9501.2);

DELETE
FROM test.station
WHERE TRUE;

SELECT count(*)
FROM test.station