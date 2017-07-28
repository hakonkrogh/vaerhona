let fetch = require('isomorphic-fetch');

const api = {};

const jsonResponseHandler = (fetchRequest) => {
    return fetchRequest
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            throw new Error();
        });
}

// Determine the api path
let apiUri;
if (typeof window !== 'undefined') {
    apiUri = location.origin + '/api';
} else if (typeof process !== 'undefined' && process.env && process.env.APP_PORT) {
    apiUri = 'http://localhost:' + process.env.APP_PORT + '/api';
}

// Get the component and query from a url
api.getRouteComponentAndMetadata = (url = '') => {
    return jsonResponseHandler(fetch(apiUri + '/util/componentandmetadatafromroute?url=' + encodeURIComponent(url)));
};

// Get the frontpage data
api.getFrontpage = () => jsonResponseHandler(fetch(apiUri + '/frontpage'));

// Get a place from name
api.getPlace = (placeName) => jsonResponseHandler(fetch(apiUri + '/place/' + placeName));

// Get the path to a snapshot image
api.getImagePath = (snapshot) => {
    return apiUri + `/snapshot/${snapshot.cuid}/image`;
};

module.exports = api;
