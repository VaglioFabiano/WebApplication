DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS memes;
DROP TABLE IF EXISTS captions;
DROP TABLE IF EXISTS memes_captions;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS games;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE memes ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT UNIQUE NOT NULL
); 

CREATE TABLE captions( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    didascalia TEXT NOT NULL
); 

CREATE TABLE rounds ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    meme_id INTEGER,
    caption_id INTEGER,
    score INTEGER NOT NULL, 
    game_id INTEGER NOT NULL, 
    FOREIGN KEY (meme_id) REFERENCES memes(id),
    FOREIGN KEY (caption_id) REFERENCES captions(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
); 

CREATE TABLE memes_captions( 
    meme_id INTEGER,
    caption_id INTEGER,
    PRIMARY KEY (meme_id, caption_id),
    FOREIGN KEY (meme_id) REFERENCES memes(id),
    FOREIGN KEY (caption_id) REFERENCES captions(id)
);

CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  total_score INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);