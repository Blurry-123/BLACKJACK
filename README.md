# MERN Stack Blackjack Game

This is a simple Blackjack game built using the MERN stack (MongoDB, Express.js, React, Node.js).

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or a MongoDB Atlas connection string)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create a `.env` file in the server directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

## Running the Application

1. Start both frontend and backend in development mode:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:5173

## Game Rules

- The goal is to get a hand value closer to 21 than the dealer without going over
- Number cards are worth their face value
- Face cards (J, Q, K) are worth 10
- Aces are worth 11 or 1, whichever is more advantageous
- The dealer must hit on 16 and stand on 17

## Features

- Start new game
- Hit (draw a card)
- Stand (end your turn)
- Automatic dealer play
- Score calculation
- Win/lose/tie detection
