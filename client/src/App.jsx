import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [game, setGame] = useState(null);
  const [message, setMessage] = useState('');

  const startNewGame = async () => {
    try {
      const response = await axios.post(`${API_URL}/game/new`);
      setGame(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Error starting new game');
    }
  };

  const hit = async () => {
    if (!game) return;
    try {
      const response = await axios.post(`${API_URL}/game/${game._id}/hit`);
      setGame(response.data);
      if (response.data.gameStatus === 'dealer-win') {
        setMessage('Bust! Dealer wins!');
      }
    } catch (error) {
      setMessage('Error hitting');
    }
  };

  const stand = async () => {
    if (!game) return;
    try {
      const response = await axios.post(`${API_URL}/game/${game._id}/stand`);
      setGame(response.data);
      if (response.data.gameStatus === 'player-win') {
        setMessage('You win!');
      } else if (response.data.gameStatus === 'dealer-win') {
        setMessage('Dealer wins!');
      } else {
        setMessage('Tie game!');
      }
    } catch (error) {
      setMessage('Error standing');
    }
  };

  const calculateScore = (hand) => {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
      const value = card.slice(0, -1);
      if (value === 'A') {
        aces += 1;
        score += 11;
      } else if (['K', 'Q', 'J'].includes(value)) {
        score += 10;
      } else {
        score += parseInt(value);
      }
    }

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  useEffect(() => {
    startNewGame();
  }, []);

  if (!game) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Blackjack</h1>
      
      <div className="game-container">
        <div className="dealer-hand">
          <h2>Dealer's Hand ({calculateScore(game.dealerHand)})</h2>
          <div className="cards">
            {game.dealerHand.map((card, index) => (
              <div key={index} className="card">
                <span className={card.includes('♥') || card.includes('♦') ? 'red' : 'black'}>
                  {card}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="player-hand">
          <h2>Your Hand ({calculateScore(game.playerHand)})</h2>
          <div className="cards">
            {game.playerHand.map((card, index) => (
              <div key={index} className="card">
                <span className={card.includes('♥') || card.includes('♦') ? 'red' : 'black'}>
                  {card}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="message">{message}</div>

        <div className="controls">
          {game.gameStatus === 'playing' && (
            <>
              <button onClick={hit}>Hit</button>
              <button onClick={stand}>Stand</button>
            </>
          )}
          {game.gameStatus !== 'playing' && (
            <button onClick={startNewGame}>New Game</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
