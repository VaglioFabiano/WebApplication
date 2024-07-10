// import
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import { getUser } from './user-dao.mjs';
import {
  getGamesByUserId,
  getRoundsByGameId,
  getMemeById,
  getMemesByIdNoExclude,
  getDidascalie,
  getCorrectCaptionByMemeId,
  getRandomCaption,
  insertRounds,
  insertGame } from './game-dao.mjs';

// Passport-related imports -- NEW
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

// init
const app = express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan('dev'));

// set up and enable CORS -- UPDATED

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true //serve al server per accettare i cookie cross origin
};
app.use(cors(corsOptions));

// Passport: set up local strategy -- NEW
passport.use(new LocalStrategy(async function verify(username, password, cb) {//cb = callback
  const user = await getUser(username, password);
  if (!user)
    return cb(null, false, 'Incorrect username or password.');

  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}

app.use(session({
  secret: "secretphrasememe",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

/* ROUTES */

//GET

app.get('/api/memes/:excludeIds?', async (req, res) => {
  try {
    const excludeIds = req.params.excludeIds ? req.params.excludeIds.split(',').map(Number) : [];

    const meme = await getMemeById(excludeIds);
    res.json(meme);
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).end();
  }
});

app.get('/api/memes/correct/:id', async (req, res) => {
  try {
    const meme = await getMemesByIdNoExclude(req.params.id);
    res.json(meme);
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).end();
  }

});

app.get('/api/memes/:id/captions', async (req, res) => {
  try {
    const captions = await getCorrectCaptionByMemeId(req.params.id);
    res.json(captions);
  } catch {
    res.status(500).end();
  }
});

app.get('/api/memes/:id/captions/random', async (req, res) => {
  try {
    const captionsArray = await getCorrectCaptionByMemeId(req.params.id);
    const captions = await getRandomCaption(req.params.id, captionsArray);
    res.json(captions);
  } catch {
    res.status(500).end();
  }
});

app.get('/api/captions/:ids', async (req, res) => {
  try {
    const ids = req.params.ids.split(',');
    const captions = await getDidascalie(ids);
    res.json(captions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/users/:id/games', async (req, res) => {
  try {
    const games = await getGamesByUserId(req.params.id);
    res.json(games);
  } catch {
    res.status(500).end();
  }
});

app.get('/api/games/:id/rounds', async (req, res) => {
  try {
    const rounds = await getRoundsByGameId(req.params.id);
    res.json(rounds);
  } catch {
    res.status(500).end();
  }
});

//POST

app.post('/api/games', async (req, res) => {
  try {
    const game = await insertGame(req.body.user_id, req.body.score);
    res.json(game);
  } catch {
    res.status(500).end();
  }
});

app.post('/api/rounds', async (req, res) => {
  try {
    const round = await insertRounds( req.body.meme_id, req.body.caption_id, req.body.score);
    res.json(round);
  } catch {
    res.status(500).end();
  }
});

// POST /api/sessions -- NEW
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).send(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      return res.status(201).json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current -- NEW
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
  res.status(401).json({error: 'Not authenticated'});
  }
});

// DELETE /api/session/current -- NEW
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// avvia il server
app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });

// serve static files
app.use(express.static('memes_images'));