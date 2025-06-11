// app.js
const express = require('express');
const path = require('path');
const app = express();
const gardenRoutes = require('./routes/garden');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Global game state (mock)
let gameState = {
   coins : 50,
   level : 1
};

// Route: Home
app.get('/', (req, res) => {
  res.render('index', gameState); // 
});

// API to update coins
app.post('/update-coins', (req, res) => {
  const { coins } = req.body;
  if (typeof coins === 'number') {
    gameState.coins = coins;
    return res.json({ success: true });
  }
  res.status(400).json({ success: false });
});

// Start server
app.listen(4000, () => {
  console.log('🌱 Garden running at http://localhost:4000');
});
