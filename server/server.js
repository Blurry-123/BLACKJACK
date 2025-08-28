const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackjack';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Game state model
const gameSchema = new mongoose.Schema({
  playerId: String,
  playerHand: [String],
  dealerHand: [String],
  deck: [String],
  gameStatus: String,
  createdAt: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', gameSchema);

// Routes
app.post('/api/game/new', async (req, res) => {
  try {
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);
    const playerHand = [shuffledDeck.pop(), shuffledDeck.pop()];
    const dealerHand = [shuffledDeck.pop(), shuffledDeck.pop()];

    const game = new Game({
      playerHand,
      dealerHand,
      deck: shuffledDeck,
      gameStatus: 'playing'
    });

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error creating new game' });
  }
});

app.post('/api/game/:id/hit', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const card = game.deck.pop();
    game.playerHand.push(card);

    const playerScore = calculateScore(game.playerHand);
    if (playerScore > 21) {
      game.gameStatus = 'dealer-win';
    }

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error hitting' });
  }
});

app.post('/api/game/:id/stand', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    while (calculateScore(game.dealerHand) < 17) {
      game.dealerHand.push(game.deck.pop());
    }

    const playerScore = calculateScore(game.playerHand);
    const dealerScore = calculateScore(game.dealerHand);

    if (dealerScore > 21 || playerScore > dealerScore) {
      game.gameStatus = 'player-win';
    } else if (dealerScore > playerScore) {
      game.gameStatus = 'dealer-win';
    } else {
      game.gameStatus = 'tie';
    }

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error standing' });
  }
});

// Helper functions
function createDeck() {
  const suits = ['♠', '♣', '♥', '♦'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push(value + suit);
    }
  }

  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateScore(hand) {
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
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
