CREATE DATABASE api_keys;

\c  api_keys

CREATE TABLE APIs (
    id SERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    api_key Text NOT NULL
);

