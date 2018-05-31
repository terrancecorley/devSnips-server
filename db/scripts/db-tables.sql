-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS snips CASCADE;
-- DROP TABLE IF EXISTS tags CASCADE;
-- DROP TABLE IF EXISTS snips_tags;

-- CREATE TABLE users(
--   id serial PRIMARY KEY,
--   username text NOT NULL UNIQUE,
--   email text NOT NULL UNIQUE,
--   password text NOT NULL,
--   created timestamp DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE snips(
--   id serial PRIMARY KEY,
--   userID integer REFERENCES users NOT NULL,
--   title text NOT NULL,
--   content text,
--   created timestamp DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE tags(
--   id serial PRIMARY KEY,
--   userID integer REFERENCES users NOT NULL,
--   name text NOT NULL UNIQUE,
--   created timestamp DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE snips_tags(
--   snipID integer REFERENCES snips,
--   tagID integer REFERENCES tags,
--   created timestamp DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO users 
--   (username, password, email) VALUES
--     ('testUser', 'testPassword', 'tmc_62692@hotmail.com');

-- INSERT INTO snips
--   (title, content, userID) VALUES
--     ('Testing Title', 'Here is some test content', 1);

-- INSERT INTO tags
--   (name, userID) VALUES
--     ('javascript', 1);