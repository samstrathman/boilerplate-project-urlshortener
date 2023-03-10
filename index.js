require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//Sam's code to complete freeCodeCamp project
//first connect to DB and set up body parser
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const isUrlHttp = require('is-url-http');
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

//create schema for URLs
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortUrl: Number,
});

let Url = mongoose.model("Url", urlSchema);

//check for a shorturl
app.get("/api/shorturl/:short_url", (req, res) => {
  let shortUrl = req.params.short_url;

  //find the matching url from the database
  Url.findOne({ shortUrl: shortUrl }).then((foundUrl) => {
    if (foundUrl) {
      res.redirect(foundUrl.originalUrl);
    } else {
      res.json({ message: "That short url doesn't exist in our database." });
    }
  })
})

//add item to database and send JSON data back to the user
app.post("/api/shorturl", (req, res) => {
  let inputUrl = req.body.url;

  //check to make sure the url is valid
  if (isUrlHttp(inputUrl)) {
    //next find the next available short url num by sorting the colleciton in reverse order
    let shortUrlNum = 1;
    Url.findOne({})
      .sort({ shortUrl: -1 })
      .exec(function(err, result) {
        if (!err) {
          if (result === null) { //input is valid but collection is empty
            let entry = new Url({ //create first entry
              originalUrl: inputUrl,
              shortUrl: shortUrlNum
            })
            //save first entry to db
            entry.save(function(err, data) {
              if (!err) {
                res.json({ //return JSON data
                  original_url: inputUrl,
                  short_url: shortUrlNum
                })
              }
              if (err) return console.error(err);
              done(null, data)
            })
          } else { //input is valid and collection is not empty
            shortUrlNum = result.shortUrl + 1;

            let entry = new Url({ //create entry
              originalUrl: inputUrl,
              shortUrl: shortUrlNum //next index in database
            })
            //save entry to db
            entry.save(function(err, data) {
              if (!err) {
                res.json({ //return JSON data
                  original_url: inputUrl,
                  short_url: shortUrlNum
                })
              }
            })
          }
        }
      })
  } else { //input is not valid
    res.json({ error: 'invalid url' });
  }
});
