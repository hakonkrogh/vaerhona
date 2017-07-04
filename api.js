let fetch = require('isomorphic-unfetch');

// Client side fix
if (fetch.default) {
    fetch = fetch.default;
}

const api = {};

// Determine the api path. Absolute for server, and relative for client
let apiPath = '/api/';
if (typeof process !== 'undefined' && process.env && process.env.APP_PORT) {
    apiPath = 'http://localhost:' + process.env.APP_PORT + '/api/';
}

// Get the component and query from a url
api.getRouteComponentAndMetadata = (url = '') => {
    return fetch(apiPath + 'componentandmetadatafromroute?url=' + encodeURIComponent(url))
        .then(r => r.json());
};

// Get some awesome data
api.getSomeAwesomeData = () => {
    return fetch(apiPath + 'awesomedata')
        .then(r => r.json());
};

module.exports = api;
