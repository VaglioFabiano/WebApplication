import { db } from './db.mjs';
import {Meme, Game, Round, Caption} from "./Model.mjs"

//genera numeri casuali non ripetuti
const generateUniqueRandomNumber = (max, exclude = []) => {
    let randomNumber;
  
    do {
      randomNumber = Math.floor(Math.random() * max);
    } while (exclude.includes(randomNumber));
  
    return randomNumber;
  };
  
  // Funzione che prende un meme in maniera random escludendo certi ID
  export const getMemeById = (excludeIds) => {
    return new Promise((resolve, reject) => {
      const randomId = generateUniqueRandomNumber(18, excludeIds);
      const sql = `SELECT * FROM memes WHERE id = ?`;
        
      db.get(sql, [randomId], (err, row) => {       
        if (err) {           
          console.error('Error executing query:', err);
          reject(err);
        } else if (!row) {           
          resolve({ error: 'Meme not found!' });
        } else {
          const meme = new Meme(row.id, row.name);
          resolve(meme);
        }
      });
    });
  };

  export const getMemesByIdNoExclude = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM memes WHERE id = ?`;
        db.get(sql, [id], (err, row) => {       
            if (err) {           
                console.error('Error executing query:', err);
                reject(err);
            } else if (!row) {           
                resolve({ error: 'Meme not found!' });
            } else {
                const meme = new Meme(row.id, row.name);
                resolve(meme);
            }
        });
    });
 }

  

//funzione che prende le caption di un meme (corrette)
export const getCorrectCaptionByMemeId = (meme_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM memes_captions WHERE meme_id = ? LIMIT 2';
        db.all(sql, [meme_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const captions = rows.map(row => row.caption_id);
                resolve(captions);
            }
        });
    });
}

//funzione che prende le caption di un meme (sbagliate) che non siano uguali a quelle del meme e non siano duplicate
export const getRandomCaption = (meme_id,captions_id) => {
    return new Promise((resolve, reject) => { 
        db.all('SELECT DISTINCT caption_id FROM memes_captions WHERE meme_id != ? AND caption_id NOT IN (?, ?) ORDER BY RANDOM() LIMIT 5',
             [meme_id, captions_id[0], captions_id[1]], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => row.caption_id));
            }
        });
    });
}

//funzione che prende le didascalie
export const getDidascalie = (caption_ids) => {
    return new Promise((resolve, reject) => {
        const placeholders = caption_ids.map(() => '?').join(',');
        const sql = `SELECT * FROM captions WHERE id IN (${placeholders})`;
        db.all(sql, caption_ids, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    id: row.id.toString(),
                    text: row.didascalia
                })));
            }
        });
    });
};

        
//funzione che inserisce il game restituisce il numero del game creato
export const insertGame = (user_id, total_score) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO games (user_id, total_score) VALUES (?, ?)';
        db.run(sql, [user_id, total_score], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

//funzione che inserisce ogni round
export const insertRounds = (meme_id, caption_id, score) => {
    return new Promise((resolve, reject) => {
        const getLastGameIdSql = 'SELECT id FROM games ORDER BY id DESC LIMIT 1';
        db.get(getLastGameIdSql, [], (err, row) => {
            if (err) {
                return reject(err);
            }
            const game_id = row ? row.id : null;
            if (!game_id) {
                return reject(new Error('No game_id found in the database'));
            }
            const insertRoundSql = 'INSERT INTO rounds (game_id, meme_id, caption_id, score) VALUES (?, ?, ?, ?)';
            db.run(insertRoundSql, [game_id, meme_id, caption_id, score], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    });
};

//funzione che getta il game per user_id
export const getGamesByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM games WHERE user_id = ?', [user_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const filteredRows = rows.filter(row => row !== undefined);
                resolve(filteredRows.map(row => new Game(row.id, row.user_id, row.total_score)));
            }
        });
    });
}


//funzione che getta i rounds per game_id
export const getRoundsByGameId = (game_id) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM rounds WHERE game_id = ?', [game_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => new Round(row.id, row.meme_id, row.caption_id, row.score, row.game_id)));
            }
        });
    });
}



