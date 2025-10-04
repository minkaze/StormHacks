const express = require('express');
const router = express.Router();
const path = require('path');

const app = express();
const port = 8000;

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'inbox.html'));
      return res.status(500);
    });

app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'login.html'));
      return res.status(500);
    });

app.get('/sent', (req, res) => {
      res.sendFile(path.join(__dirname, 'public','sent.html'));
      return res.status(500);
    });

app.get('/signup', (req, res) => {
      res.sendFile(path.join(__dirname,'public','signup.html'));
      return res.status(500);
    });