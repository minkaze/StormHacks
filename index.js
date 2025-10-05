// index.js (all Mongoose)
const express = require('express');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const { sign } = require('crypto');
const chatRouter = require('./backend/chat');
      // your Mongoose User model

const app = express();
const port = process.env.PORT || 8000;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    return connection;
    } catch (err) {
        console.error ('Error Connecting: ', err.message);
        process.exit(1);
    }
};
app.use('/css', express.static(path.join(__dirname, 'css')));
app.set('view engine', 'ejs');
app.set('views', './views');

// ----- Parsers & Static -----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/chat',chatRouter);

// ----- Validation Schemas -----
const signUpSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// ----- Auth Guard -----
function ensureAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect('/login');
}

(async () => {
  try {
    // 1) Connect to MongoDB (Mongoose)
    await connectDB();

    // 2) Sessions (with connect-mongo, using Mongoose connection string)
    app.use(session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 60 * 60, // seconds
      }),
      cookie: {
        maxAge: 60 * 60 * 1000, // 1 hour
        httpOnly: true,
        sameSite: 'lax',
        // secure: true, // uncomment in production behind HTTPS
      },
    }));

    // 3) Pages
    app.get('/',   (req, res) => {
      res.render("inbox", { stylesheets : ["signup.css", "header.css", "app.css"],
                            scripts : [],
      });
    });
   app.get('/login',   (req, res) => {
      res.render("login", { stylesheets : ["signup.css", "header.css", "app.css"],
                            scripts : [],
      });
    });
       app.get('/signup',   (req, res) => {
      res.render("signup", { stylesheets : ["signup.css", "app.css"],
                            scripts : [],
      });
    });
       app.get('/sent',   (req, res) => {
      res.render("sent", { stylesheets : [],
                            scripts : [],
      });
    });
    
    app.get('/logout', (req, res) => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
      });
    });

    app.get('/chat', (req, res) => {
      res.render('chat');
    });

    // 4) APIs
    app.get('/user', ensureAuth, async (req, res) => {
      try {
        const user = await User.findOne(
          { email: req.session.user.email },
          { firstName: 1, _id: 0 }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ firstName: user.firstName });
      } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });

    app.post('/signup', async (req, res) => {
      const { firstName, email, password } = req.body;

      // Validate input
      const { error } = signUpSchema.validate({ firstName, email, password });
      if (error) {
        return res
          .status(400)
          .send(`<p>${error.details[0].message}</p><a href="/signup">Try again</a>`);
      }

      try {
        // Enforce uniqueness by checking first (also have a unique index in the model)
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
          return res
            .status(400)
            .send('<p>Email already in use.</p><a href="/signup">Try again</a>');
        }

        // Hash & create
        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          firstName: firstName.trim(),
          email: email.toLowerCase().trim(),
          password: hashed,
        });

        // Create session
        req.session.user = { firstName: newUser.firstName, email: newUser.email };
        res.redirect('/inbox');
      } catch (e) {
        // Duplicate key safety net
        if (e && e.code === 11000) {
          return res
            .status(400)
            .send('<p>Email already in use.</p><a href="/signup">Try again</a>');
        }
        console.error('Signup error:', e);
        res.status(500).send('<p>Server error.</p><a href="/signup">Try again</a>');
      }
    });

    app.post('/login', async (req, res) => {
      const { email, password } = req.body;

      // Validate input
      const { error } = signinSchema.validate({ email, password });
      if (error) {
        return res
          .status(400)
          .send(`<p>${error.details[0].message}</p><a href="/login">Try again</a>`);
      }

      try {
        // Because we set password select:false in the model, select it explicitly
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
          return res.status(400).send('<p>Email not found.</p><a href="/login">Try again</a>');
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          return res.status(400).send('<p>Incorrect password.</p><a href="/login">Try again</a>');
        }

        req.session.user = { firstName: user.firstName, email: user.email };
        res.redirect('/inbox');
      } catch (e) {
        console.error('Login error:', e);
        res.status(500).send('<p>Server error.</p><a href="/login">Try again</a>');
      }
    });

    // 5) Start server AFTER everything is wired
    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
