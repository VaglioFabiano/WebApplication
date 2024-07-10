import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getMemesByIdNoExclude, getDidascalie } from '../API.mjs';
import { Navigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

class Round {
    constructor(meme_id, caption_id, is_correct) {
        this.meme_id = meme_id;
        this.caption_id = caption_id;
        this.is_correct = is_correct;
        this.memeName = {};
        this.didascaliaText = [];
    }

    async fetchMeme() {
        try {
            this.memeName = await getMemesByIdNoExclude(this.meme_id);
            this.didascaliaText = await getDidascalie(this.caption_id);
        } catch (error) {
            console.error("fetchMeme error:", error);
        }
    }
}

const SummaryPage = ({ loggedIn, handleLogout, user }) => {
    const location = useLocation();
    const { roundResults, totalScore } = location.state || { roundResults: [], totalScore: 0 };
    const [memeData, setMemeData] = useState([]);

    if (!loggedIn) {
        return <Navigate to="/" />;
    }

    const fetchData = useCallback(async () => {
        let data = [];
        for (let result of roundResults) {
            if (result.is_correct) {
                const round = new Round(result.meme_id, result.caption_id, result.is_correct);
                await round.fetchMeme();
                data.push(round);
            }
        }
        setMemeData(data);
    }, [roundResults]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="main-content-Summary">
            <h1>Riassunto Ultima Partita</h1>
            <h2>Punteggio Totale: {totalScore}</h2>
            {loggedIn ? (
                <div className='DettagliRoundCorretti'>
                    <h3>Dettagli dei Round Corretti:</h3>
                    <ul className="summary-list">
                        {memeData.map((round, index) => (
                            <li key={index}>
                                <img src={round.memeName.name} alt={`Meme ${round.meme_id}`} style={{ width: '150px', height: '150px' }} />
                                {round.didascaliaText.length > 0 ? round.didascaliaText[0].text : 'N/A'}
                            </li>
                        ))}
                    </ul>
                    <Link to="/" className="btn btn-primary mx-2 b">Home Page</Link>
                    <Link to="/GamePage"><Button variant="secondary" className="mx-2  b">Gioca</Button></Link>
                    <Link to="/UserProfile" className="btn btn-success mx-2 ">Profilo Utente</Link>
                </div>
            ) : (
                <div className="no-results">
                    <h1>Gioca qui</h1>
                    <Button as={Link} to="/GamePage" variant="secondary" className="mx-2 btn-wide b">Gioca</Button>
                </div>
            )}
        </div>
    );
};

export default SummaryPage;
