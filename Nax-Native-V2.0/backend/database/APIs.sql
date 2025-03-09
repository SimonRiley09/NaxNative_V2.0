CREATE DATABASE api_keys;

\c  mydatabse

CREATE TABLE APIs (
    id SERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    api_key Text NOT NULL
);

