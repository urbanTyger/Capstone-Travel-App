// /.netlify/functions/historicweather
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

exports.handler = function (event, context, callback) {
    const dataString = JSON.parse(event.body);
    const { VISUALCROSSING_HISTORIC_URL, VISUALCROSSING_KEY } = process.env;
    const requestString = `${process.env.VISUALCROSSING_HISTORIC_URL}&locations=${dataString.city}&startDateTime=${dataString.start}&key=${process.env.VISUALCROSSING_KEY}`;
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
                body: JSON.stringify(message.locations[dataString.city])
            });

        })
}
