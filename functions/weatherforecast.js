// /.netlify/functions/weatherforecast
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();


exports.handler = function (event, context, callback) {
    const dataString = JSON.parse(event.body);
    const { WEATHERBIT_URL, WEATHERBIT_KEY } = process.env;
    const requestString = `${WEATHERBIT_URL}&days=13&lat=${dataString.lat}&lon=${dataString.lng}&key=${WEATHERBIT_KEY}`;
    fetch(requestString)
        .then(res => res.json())
        .then(message => {
            callback(null, {
                statusCode: 200,
                // headers: {
                //     'Access-Control-Allow-Origin': '*',
                //     'Access-Control-Allow-Headers':
                //         'Origin, X-Requested-With, Content-Type, Accept'
                // },
                body: JSON.stringify(message)
            });

        })
}
