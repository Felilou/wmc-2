DROP DATABASE IF EXISTS bierchen;

CREATE DATABASE bierchen;

USE bierchen;

CREATE TABLE brewery (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE beer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    brewery_id BIGINT UNSIGNED,
    rating INT,
    CHECK(rating >= 0 AND rating <= 10),
    FOREIGN KEY (brewery_id) REFERENCES brewery(id)
);