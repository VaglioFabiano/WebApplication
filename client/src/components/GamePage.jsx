import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { getMemesById, getRandomCaption, getCorrectCaptionByMemeId, getDidascalie, insertRounds, insertGame } from '../API.mjs';

class Didascalia {
  constructor(id, text) {
    this.id = id;
    this.text = text;
  }
}

class Meme {
  constructor(id, name, correctCaptions = [], wrongCaptions = []) {
    this.id = id.toString();
    this.name = name;
    this.correctCaptions = correctCaptions.map(c => c.toString());
    this.wrongCaptions = wrongCaptions.map(c => c.toString());
    this.Allcaptions = [...this.correctCaptions, ...this.wrongCaptions];
    this.AllcaptionsText = [];
  }

  async fetchCaptionsText() {
    const didascalie = await getDidascalie(this.Allcaptions);
    this.AllcaptionsText = didascalie.map(item => new Didascalia(item.id, item.text));
    this.AllcaptionsText.sort(() => Math.random() - 0.5);
  }
}

function useTimer(initialDuration, onTimeUp, resetTrigger) {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isStopped, setIsStopped] = useState(false);

  useEffect(() => {
    setTimeLeft(initialDuration);
    setIsStopped(false);
  }, [initialDuration, resetTrigger]);

  useEffect(() => {
    if (timeLeft > 0 && !isStopped) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }, 1000);

      return () => clearInterval(timerId);
    } else if (timeLeft <= 0 && !isStopped) {
      onTimeUp();
      setIsStopped(true);
    }
  }, [timeLeft, onTimeUp, isStopped]);

  const stopTimer = () => {
    setIsStopped(true);
  };

  const resetTimer = () => {
    setIsStopped(false);
    setTimeLeft(initialDuration);
  };

  return { timeLeft, stopTimer, resetTimer };
}

function GamePage({ loggedIn, handleLogout, user }) {
  const [currentMeme, setCurrentMeme] = useState(null);
  const [selectedCaptionId, setSelectedCaptionId] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [usedMemeIds, setUsedMemeIds] = useState([]);
  const [message, setMessage] = useState('');
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const maxRounds = loggedIn ? 3 : 1;

  useEffect(() => {
    if (currentRound > maxRounds && roundResults.length === maxRounds) {
      setTimeout(finalizeGame, 3000);
    }
  }, [currentRound, roundResults, maxRounds]);

  useEffect(() => {
    if (currentRound <= maxRounds) {
      loadRandomMeme();
      setResetTrigger(currentRound);
      setMessage('');
    }
  }, [currentRound, maxRounds]);

  const handleTimeUp = () => {
    saveRoundAndProceed();
  };

  const { timeLeft, stopTimer, resetTimer } = useTimer(30, handleTimeUp, resetTrigger);

  const loadRandomMeme = async () => {
    try {
      const meme = await getMemesById(usedMemeIds);
      if (!meme || meme.error) {
        console.error('No meme found');
        return;
      }

      const correctCaptions = await getCorrectCaptionByMemeId(meme.id);
      const wrongCaptions = await getRandomCaption(meme.id);
      const memeObj = new Meme(meme.id, meme.name, correctCaptions, wrongCaptions);
      await memeObj.fetchCaptionsText();
      setCurrentMeme(memeObj);
      setSelectedCaptionId('');
      setUsedMemeIds(prev => [...prev, meme.id]);
      setIsFormDisabled(false); 
    } catch (error) {
      console.error('Error loading meme:', error);
    }
  };

  const saveRoundResult = () => {
    const isCorrect = currentMeme.correctCaptions.includes(selectedCaptionId);
    const newResult = {
      meme_id: currentMeme.id,
      caption_id: selectedCaptionId,
      is_correct: isCorrect
    };
    setRoundResults(prevResults => [...prevResults, newResult]);
    setMessage(
      isCorrect
        ? 'La risposta selezionata era corretta, hai ottenuto 5 punti!'
        : (
          <>
            <p>La risposta era errata, hai ottenuto 0 punti.</p>
            <p>Ecco le due didascalie corrette per il meme dato:</p>
            <p>{currentMeme.AllcaptionsText
              .filter(caption => currentMeme.correctCaptions.includes(caption.id))
              .map((caption, index) => (
                <React.Fragment key={index}>
                  {caption.text}
                  {index < currentMeme.correctCaptions.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </>
        )
    );
    setIsFormDisabled(true);
  };

  const saveRoundAndProceed = () => {
    saveRoundResult();
    const delay = 6000; 
    if (currentRound < maxRounds) {
      setTimeout(() => {
        setCurrentRound(prevRound => prevRound + 1);
        setMessage('');
        resetTimer();
      }, delay);
    } else {
      setTimeout(() => {
        setCurrentRound(prevRound => prevRound + 0.1);
      }, (delay - 3000));
    }
  };

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    stopTimer(); 
    saveRoundAndProceed();
  };

  const handleCaptionChange = (e) => {
    setSelectedCaptionId(e.target.value);
  };

  const finalizeGame = async () => {
    try {
      const totalScore = roundResults.reduce((sum, round) => sum + (round.is_correct ? 5 : 0), 0);
      if (loggedIn) {
        const userId = user.id;
        await insertGame(userId, totalScore);
        for (const round of roundResults) {
          const roundScore = round.is_correct ? 5 : 0;
          await insertRounds(round.meme_id, round.caption_id, roundScore);
        }
      }
      navigate('/SummaryPage', { state: { roundResults, totalScore } });
    } catch (error) {
      console.error('Errore durante il salvataggio del gioco e dei round:', error);
    }
  };

  return (
    <>
      <div className="content-wrapper full-height d-flex justify-content-start align-items-start">
        <div className='Round'>
          <p>Round</p>
          <p>{Math.floor(currentRound)} / {maxRounds}</p>
        </div>
        <div className="game-box imgMeme-container">
          {currentMeme && (
            <img className="imgMeme" src={currentMeme.name} alt={`Meme ${currentMeme.name}`} />
          )}
        </div>
        <div className="game-box content-box">
          <Form onSubmit={handleSubmit} ref={formRef}>
            <Form.Group controlId="formCaption" className="caption-container">
              <Form.Label>Scegliere una tra le seguenti opzioni: </Form.Label>
              {currentMeme && currentMeme.AllcaptionsText.map((caption, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  name="captions"
                  id={`caption-${caption.id}`}
                  label={caption.text}
                  value={caption.id}
                  checked={selectedCaptionId === caption.id}
                  onChange={handleCaptionChange}
                  disabled={isFormDisabled}
                />
              ))}
            </Form.Group>
            <Button className="btnGame" variant="primary" type="submit" value="submit" disabled={isFormDisabled}>
              {currentRound < maxRounds ? 'Invia e prossimo meme' : 'Invia tutto e termina'}
            </Button>
          </Form>
          {message && (
            <Alert variant={roundResults[roundResults.length - 1]?.is_correct ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}
        </div>
      </div>
      <div className="timer-box">
        {timeLeft} seconds
      </div>
    </>
  );
}

export default GamePage;
