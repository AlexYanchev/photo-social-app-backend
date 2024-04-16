import express from 'express';
import mongoose from 'mongoose';
import Posts from './postModel.js';
import * as dotenv from 'dotenv';
import Pusher from 'pusher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const PASSWORD_DB = process.env.PASSWORD_DB;
const LOGIN_DB = process.env.LOGIN_DB;
const connection_url = `mongodb+srv://${LOGIN_DB}:${PASSWORD_DB}@cluster0.rygv9wf.mongodb.net/?retryWrites=true&w=majority`;

const pusher = new Pusher({
  appId: process.env.PUSHER_API_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

mongoose.connect(connection_url);

const changeStream = Posts.watch();

changeStream.on('change', (change) => {
  if (change.operationType === 'insert') {
    const postDetails = change.fullDocument;
    pusher.trigger('posts', 'inserted', {
      username: postDetails.username,
      caption: postDetails.caption,
      imageUrl: postDetails.imageUrl,
    });
  } else {
    console.log('Error trigerring Pusher');
  }
});

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/', (req, res) => res.status(200).send('Hello TheWebDev'));

app.post('/upload', (req, res) => {
  const dbPost = req.body;
  Posts.create(dbPost)
    .then((r) => {
      res.status(201).send(r);
    })
    .catch((err) => res.status(500).send(err));
});

app.get('/sync', (req, res) => {
  Posts.find()
    .then((r) => {
      res.status(201).send(r);
    })
    .catch((err) => res.status(500).send(err));
});
app.listen(PORT, () => console.log(`Listening on localhost: ${PORT}`));
