const PlaceService = require("./place-service");
const SnapshotService = require("./snapshot-service");

async function componentAndMetadataFromRoute(_url) {
  let url = decodeURIComponent(_url);

  url = url.replace(/http(s?):\/\/[^\/]*/, "");
  if (url[0] !== "/") {
    url = "/" + url;
  }

  if (url.startsWith("/_next")) return { match: false };
  if (url.startsWith("/static")) return { match: false };
  if (url.startsWith("/favico")) return { match: false };

  // Front page
  if (url === "/") {
    return { match: true, hrefResolved: url, componentName: "" };
  }

  // Check for place page (/:placeName)
  if (url.match(/\//g).length === 1) {
    const placeName = url.replace("/", "");
    try {
      const place = await PlaceService.getPlace({ placeName });

      if (place && place.isPublic) {
        return {
          match: true,
          componentName: "place",
          query: { placeName }
        };
      }

      return { match: false };
    } catch (error) {
      return { match: false, error };
    }
  }

  return { match: false };
}

module.exports = {
  PlaceService,
  SnapshotService,
  componentAndMetadataFromRoute
};
