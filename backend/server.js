import express from 'express';
import chatRouter from './chat.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views/partials');

app.use(express.json());
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
  res.render('chat');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));