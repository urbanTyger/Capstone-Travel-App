// /.netlify/functions/historicweather
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

exports.handler = function (event, context, callback) {
    const dataString = JSON.parse(event.body);
    const { WEATHERBIT_HISTORIC_URL, WEATHERBIT_KEY } = process.env;
    const requestString = `${WEATHERBIT_HISTORIC_URL}?city=${dataString.city}&start_date=${dataString.start}&end_date=${dataString.end}&key=${WEATHERBIT_KEY}`;
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
