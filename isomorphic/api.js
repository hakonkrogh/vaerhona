let fetch = require('isomorphic-fetch');

// Client side fix
if (fetch.default) {
    fetch = fetch.default;
}

const api = {};

// Determine the api path. Absolute for server, and relative for client
let apiUri;
if (typeof window !== 'undefined') {
    apiUri = location.origin + '/api';
} else if (typeof process !== 'undefined' && process.env && process.env.APP_PORT) {
    apiUri = 'http://localhost:' + process.env.APP_PORT + '/api';
}

// Get the component and query from a url
api.getRouteComponentAndMetadata = (url = '') => {
    return fetch(apiUri + '/util/componentandmetadatafromroute?url=' + encodeURIComponent(url))
        .then(r => r.json());
};

// Get some awesome data
api.getSomeAwesomeData = () => {
    return fetch(apiUri + '/awesomedata')
        .then(r => r.json());
};

module.exports = api;
