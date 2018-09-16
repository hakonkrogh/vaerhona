const fetch = require("isomorphic-unfetch");
const querystring = require("querystring");

const config = require("../config");

const useApi = config.graphqlSource === "api";

async function getPlace({ placeName, from, to }) {
  if (useApi) {
    const response = await fetch(
      `${config.apiUri}/place/${placeName}?${querystring.stringify({
        from,
        to
      })}`
    );
    return response.json();
  }

  return {
    cuid: "1",
    name: "Test"
  };
}

async function getPlaces() {
  if (useApi) {
    const response = await fetch(`${config.apiUri}/place`);
    return response.json();
  }

  return [
    {
      cuid: "1",
      name: "Test"
    }
  ];
}

module.exports = {
  getPlace,
  getPlaces
};
