// /.netlify/functions/geolocation
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();


exports.handler = function (event, context, callback) {
    const dataString = JSON.parse(event.body);
    const { GEONAMES_URL, GEONAMES_KEY } = process.env;
    const requestString = `${GEONAMES_URL}=${dataString.name.replace(/\s/g, "%20")}&username=${GEONAMES_KEY}`;
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
