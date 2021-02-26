// /.netlify/functions/backgroundurl
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();


exports.handler = function (event, context, callback) {
    const dataString = JSON.parse(event.body);
    const { PIXABAY_URL, PIXABAY_KEY, PIXABAY_SPECS } = process.env;
    const requestString = `${PIXABAY_URL}?key=${PIXABAY_KEY}&q=${dataString.name.split(',')[0].replace(/\s/g, "%20")}${PIXABAY_SPECS}`;
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