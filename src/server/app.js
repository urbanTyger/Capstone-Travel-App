const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
// const { Console } = require('console');
dotenv.config();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors());
app.use(cors(corsOptions));
app.use(express.static('dist'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

console.log(__dirname);



app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', true);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();

app.get('/', function (req, res) {
    res.status(200).json({ "answer": "Hello World!" });
})
// uses weatherbit and is limited to a few weeks.
app.post(('/old_historicweather'), async (request, response) => {
    const dataString = request.body;
    const requestString = `${process.env.WEATHERBIT_HISTORIC_URL}?city=${dataString.city}&start_date=${dataString.start}&end_date=${dataString.end}&key=${process.env.WEATHERBIT_KEY}`;
    fetch(requestString)
        .then(res => res.json())
        .then(res => {
            response.send(res);
        })
        .catch(err => {
            response.send(err);
        });
});

app.post(('/historicweather'), async (request, response) => {
    const dataString = request.body;
    const requestString = `${process.env.VISUALCROSSING_HISTORIC_URL}&locations=${dataString.city}&startDateTime=${dataString.start}&key=${process.env.VISUALCROSSING_KEY}`;
    fetch(requestString)
        .then(res => res.json())
        .then(res => {
            response.send(res.locations[dataString.city]);
        })
        .catch(err => {
            response.send(err);
        });
});

app.post(('/weatherforecast'), async (request, response) => {
    const dataString = request.body;
    const requestString = `${process.env.WEATHERBIT_URL}&days=13&lat=${dataString.lat}&lon=${dataString.lng}&key=${process.env.WEATHERBIT_KEY}`;
    fetch(requestString)
        .then(res => res.json())
        .then(res => {
            res.countryName = dataString.countryName;
            response.send(res);
        })
        .catch(err => {
            response.send(err);
        });
});

app.post(('/backgroundurl'), async (request, response) => {
    const dataString = request.body;
    const requestString = `${process.env.PIXABAY_URL}?key=${process.env.PIXABAY_KEY}&q=${dataString.name.split(',')[0].replace(/\s/g, "%20")}${process.env.PIXABAY_SPECS}`;
    fetch(requestString)
        .then(res => res.json())
        .then(res => {
            response.send(res);
        })
        .catch(err => {
            response.send(err);
        });
});


app.post(('/geolocation'), async (request, response) => {
    const dataString = request.body;
    const requestString = `${process.env.GEONAMES_URL}=${dataString.name.replace(/\s/g, "%20")}&username=${process.env.GEONAMES_KEY}`;
    fetch(requestString)
        .then(res => res.json())
        .then(data => response.send(data))
        .catch(err => res.send(err))
});

module.exports = app;

