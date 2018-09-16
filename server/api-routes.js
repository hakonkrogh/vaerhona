const Router = require("express").Router;
const router = new Router();

const {
  componentAndMetadataFromRoute,
  SnapshotService
} = require("./services");

router.route("/util/componentandmetadatafromroute").get(async (req, res) => {
  const match = await componentAndMetadataFromRoute(req.query.url);
  res.json(match);
});

router.route("/snapshot/:id/image").get(async (req, res) => {
  try {
    const accept = req.headers["accept"];
    const browserSupportsWebp = accept.indexOf("image/webp") !== -1;

    const image = await SnapshotService.getSnapshotImage({
      id: req.params.id,
      webp: browserSupportsWebp
    });

    res.set(image.headers);
    res.end(image.buffer, "binary");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
