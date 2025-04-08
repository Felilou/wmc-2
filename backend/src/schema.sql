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

-- Insert breweries
INSERT INTO brewery (name, description, image_url) VALUES
('Brewery One', 'A small local brewery.', '/api/img/brewery/default.png'),
('Brewery Two', 'Known for its unique flavors.', '/api/img/brewery/default.png'),
('Brewery Three', 'Award-winning brewery.', '/api/img/brewery/default.png'),
('Brewery Four', 'Family-owned since 1920.', '/api/img/brewery/default.png'),
('Brewery Five', 'Innovative craft beers.', '/api/img/brewery/default.png');

-- Insert beers
INSERT INTO beer (name, description, image_url, brewery_id, rating) VALUES
('Beer One', 'A refreshing lager.', '/api/img/beer/default.png', 1, 8),
('Beer Two', 'A strong IPA.', '/api/img/beer/default.png', 1, 7),
('Beer Three', 'A smooth stout.', '/api/img/beer/default.png', 2, 9),
('Beer Four', 'A light pilsner.', '/api/img/beer/default.png', 2, 6),
('Beer Five', 'A fruity ale.', '/api/img/beer/default.png', 3, 8),
('Beer Six', 'A dark porter.', '/api/img/beer/default.png', 3, 7),
('Beer Seven', 'A crisp wheat beer.', '/api/img/beer/default.png', 4, 8),
('Beer Eight', 'A hoppy pale ale.', '/api/img/beer/default.png', 4, 9),
('Beer Nine', 'A rich brown ale.', '/api/img/beer/default.png', 5, 7),
('Beer Ten', 'A classic bitter.', '/api/img/beer/default.png', 5, 6),
('Beer Eleven', 'A tangy sour beer.', '/api/img/beer/default.png', 1, 8),
('Beer Twelve', 'A smooth amber ale.', '/api/img/beer/default.png', 1, 7),
('Beer Thirteen', 'A refreshing saison.', '/api/img/beer/default.png', 2, 9),
('Beer Fourteen', 'A bold barleywine.', '/api/img/beer/default.png', 2, 6),
('Beer Fifteen', 'A spicy rye beer.', '/api/img/beer/default.png', 3, 8),
('Beer Sixteen', 'A sweet mead.', '/api/img/beer/default.png', 3, 7),
('Beer Seventeen', 'A tart gose.', '/api/img/beer/default.png', 4, 8),
('Beer Eighteen', 'A creamy milk stout.', '/api/img/beer/default.png', 4, 9),
('Beer Nineteen', 'A dry cider.', '/api/img/beer/default.png', 5, 7),
('Beer Twenty', 'A herbal gruit.', '/api/img/beer/default.png', 5, 6);