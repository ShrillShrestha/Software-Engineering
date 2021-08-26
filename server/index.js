var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const { client } = require('./utils/databaseConnection');
const path = require("path");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, "..", "frontend", "build")));

app.get('/poc', async (req, res) => {
  try {
    let ans = await client.query('SELECT * FROM person');
    res.json(ans.rows);
  } catch (error) {
    res.send(error);
  }
});

app.post('/poc', async (req, res) => {
  try {
    let newRow = await client.query({
      text: 'INSERT INTO person VALUES($1, $2)',
      values: [req.body.name, req.body.phone],
    });

    res.send(newRow);
  } catch (error) {
    res.send(error);
  }
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, "..", "frontend" , "build", "index.html"));
});

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
