const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

// mongodb connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log(`DB connection error - ${err}`));

// Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  exercise: [{
    description: String,
    duration: Number,
    date: String
  }]
});

// Model
const User = mongoose.model("User", userSchema);

// Create a new user
app.post('/api/users', function(req, res) {
  const { username } = req.body;
  const newUser = new User({ username: username });
  newUser.save(function(err, data) {
    if (err) return console.log(err);
    res.json(data);
  });
});

// Get users
app.get('/api/users', function(req, res) {
  User.find({}, function(err, data) {
    if (err) return console.log(err);
    res.json(data);
  });
});

// Add exercise
app.post('/api/users/:_id/exercises', function(req, res) {
  const userId = req.params._id;
  User.findById(userId, function(err, user) {
    if (err) return console.log(err);
    user.exercise = user.exercise || [];
    user.exercise.push({
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(req.body.date).toDateString(),
    });
    user.save(function(err, userUpdated) {
      if (err) return console.log(err);
      res.json(userUpdated);
    });
  })
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
