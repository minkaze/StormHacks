require('dotenv').config();
const mongoose = require('mongoose');
const Email = require('./models/email');

const MONGO_URI = process.env.MONGO_URI;

const mockEmails = [
  {
    from: 'alice@example.com',
    fromName: 'Alice Johnson',
    subject: 'Welcome to the team!',
    content: 'Hi Janvi, excited to have you on board. Let’s catch up this week!'
  },
  {
    from: 'bob@example.com',
    fromName: 'Bob Smith',
    subject: 'Meeting Reminder',
    content: 'Reminder: Project meeting scheduled for tomorrow at 2 PM.'
  },
  {
    from: 'no-reply@newsletter.com',
    fromName: 'Tech Weekly',
    subject: 'Your Weekly Tech Digest',
    content: 'Here are this week’s top stories in tech...'
  }
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    await Email.deleteMany({});
    console.log('Cleared old emails.');

    await Email.insertMany(mockEmails);
    console.log('Inserted mock emails.');

    await mongoose.disconnect();
    console.log('Done. Connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding emails:', err);
    process.exit(1);
  }
})();
