const fetch = require("isomorphic-fetch");

const api = {};
let clientInfo = {};

// A generic fetch json request handler
const jsonResponseHandler = fetchRequest => {
  return fetchRequest.then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response);
  });
};

// Determine the api path
let apiUri;
if (typeof window !== "undefined") {
  apiUri = location.origin + "/api";
} else if (
  typeof process !== "undefined" &&
  process.env &&
  process.env.APP_PORT
) {
  apiUri = "http://localhost:" + process.env.APP_PORT + "/api";
}

// Get the component and query from a url
api.getRouteComponentAndMetadata = (url = "") => {
  const apiRoute =
    apiUri +
    "/util/componentandmetadatafromroute?url=" +
    encodeURIComponent(url);
  return jsonResponseHandler(fetch(apiRoute));
};

// Get the frontpage data
api.getFrontpage = () => jsonResponseHandler(fetch(apiUri + "/frontpage"));

// Get a place from name
api.getPlace = placeName =>
  jsonResponseHandler(fetch(apiUri + "/place/" + placeName));

// Get snapshots for place
api.getSnapshots = placeName =>
  jsonResponseHandler(fetch(apiUri + "/snapshots/" + placeName));

// Get snapshots and place
api.getSnapshotsAndPlace = placeName =>
  jsonResponseHandler(fetch(apiUri + "/place-and-snapshots/" + placeName));

// Get the path to a snapshot image
const jpegStorageDate = new Date("2018-02-22");
api.getImagePath = ({ snapshot }) => {
  // if (clientInfo.webp) {
  //     return snapshot.imagePath;
  // }
  // if (typeof __NEXT_DATA__ !== 'undefined' && __NEXT_DATA__.props.initialState.app.clientInfo.webp) {
  //     return snapshot.imagePath;
  // }
  // if (absolutePath) {
  //   return `${apiUri}/snapshot/${snapshot.cuid}/image`;
  // }

  // Newer image. Get directly from S3
  if (new Date(snapshot.dateAdded) >= jpegStorageDate) {
    return snapshot.imagePath;
  }

  // Older image. We need to go through the API since we might need to do image transform from webp to jpeg
  return `/api/snapshot/${snapshot.cuid}/image`;
};

// Get the path to a snapshot image
api.setClientInfo = c => (clientInfo = c);

module.exports = api;
