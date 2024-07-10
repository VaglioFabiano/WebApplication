import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Container } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';
import {
    getMemesByIdNoExclude,
    getDidascalie,
    getGamesByUserId,
    getRoundsByGameId
} from '../API.mjs';

class Didascalia {
    constructor(id, text) {
        this.id = id;
        this.text = text;
    }
}

class ShowRound {
    constructor(roundId, memeId, captionId, score, gameId) {
        this.roundId = roundId;
        this.memeId = memeId;
        this.captionId = captionId;
        this.score = score;
        this.gameId = gameId;
        this.captionText = '';
        this.memePath = '';
    }

    async fetchShowRound() {
        try {
            if (this.captionId !== null && this.captionId !== undefined && this.captionId !== '') {
    
                const didascalie = await getDidascalie([this.captionId]);
                if (didascalie.length > 0) {
                    const didascalia = new Didascalia(didascalie[0].id, didascalie[0].text);
                    this.captionText = didascalia.text;
                } else {
                    this.captionText = 'Didascalia non inserita';
                }
            } else {
                this.captionText = 'Didascalia non inserita';
            }
    
            const meme = await getMemesByIdNoExclude(this.memeId);
            this.memePath = meme.name;
        } catch (error) {
            console.error("Error fetching show round:", error);
        }
    }
    
}

class ShowGame {
    constructor(userId, gameId, totalScore) {
        this.userId = userId;
        this.gameId = gameId;
        this.rounds = [];
        this.totalScore = totalScore;
    }

    async fetchShowGame() {
        try {
            const rounds = await getRoundsByGameId(this.gameId);
            this.rounds = await Promise.all(
                rounds.map(async item => {
                    const round = new ShowRound(item.id, item.meme_id, item.caption_id, item.score, item.game_id);
                    await round.fetchShowRound();
                    return round;
                })
            );
        } catch (error) {
            console.error("Error fetching game rounds:", error);
        }
    }
}

function UserProfile({ loggedIn, user, handleLogout }) {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const games = await getGamesByUserId(user.id);
                const gameObjects = await Promise.all(
                    games.map(async game => {
                        const showGame = new ShowGame(user.id, game.id, game.total_score);
                        await showGame.fetchShowGame();
                        return showGame;
                    })
                );
                setGames(gameObjects);
            } catch (error) {
                console.error("Error fetching games:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [user]);

    if (!loggedIn) {
        return <Navigate to="/" />;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container-wrapper">
            <div className="sidebar">
                <img src="../immagini/facciaUtente.png" alt="HomeFace" className="img-fluid3" />
                <h2>{user.username}</h2><br />
                <p><b>Partite giocate: </b>{games.length}</p>
                <p><b>Punteggio medio: </b>{(games.reduce((acc, game) => acc + game.totalScore, 0) / games.length || 0).toFixed(2)}</p>
                <Link to="/" className="btn btn-primary mx-2 a">Home Page</Link>
                <Link to="/GamePage"><Button variant="secondary" className="mx-2 btn-wide a" to="/GamePage">Gioca</Button></Link>
            </div>
            <div className="main-content">
                <h1>Partite Effettuate </h1>
                
                {games.map((game, gameIndex) => (
                    <div className= "game-content" key={gameIndex}>
                        <h3>Game {gameIndex + 1}</h3>
                        <h4>Total Score: {game.totalScore}</h4>
                        {game.rounds.map((round, roundIndex) => (
                            <React.Fragment key={round.roundId}>
                                {roundIndex % 3 === 0 && roundIndex !== 0 && <hr />}
                                <div className="round-container">
                                    <div className="round-image">
                                        <h4 className='NumeroRound'>Round {roundIndex + 1}</h4>
                                        <img src={round.memePath} alt={`Meme ${round.memePath}`} style={{ width: '150px', height: '150px' }} />
                                    </div>
                                    <div className="round-caption">
                                        <p>{round.captionText}</p>
                                        <p><b>Score: </b>{round.score}</p>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserProfile;
