const fetch = require("isomorphic-unfetch");

// A generic fetch json request handler
async function jsonResponseHandler(fetchRequest) {
  const response = await fetchRequest;
  if (!response.ok) {
    throw new Error(response);
  }
  return response.json();
}

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
export async function getRouteComponentAndMetadata(url = "") {
  const apiRoute =
    apiUri +
    "/util/componentandmetadatafromroute?url=" +
    encodeURIComponent(url);
  return jsonResponseHandler(fetch(apiRoute));
}

// Get the path to a snapshot image
const jpegStorageDate = new Date("2018-02-22");
export function getImagePath({ snapshot }) {
  // Newer image. Get directly from S3
  if (snapshot.image && new Date(snapshot.date) >= jpegStorageDate) {
    return snapshot.image;
  }

  // Older image. We need to go through the API since we might need to do image transform from webp to jpeg
  return `/api/snapshot/${snapshot.cuid}/image`;
}

// Get the path to a snapshot image
export function setClientInfo(c) {
  clientInfo = c;
}
