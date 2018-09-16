require("dotenv").config();

if (!process.env.API_URI) {
  console.error("Cannot start. Missing process.env.API_URI");
  return;
}

const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const { componentAndMetadataFromRoute } = require("./services");
const apiRoutes = require("./api-routes");
const startApollo = require("./apollo");

app.prepare().then(() => {
  const server = express();

  startApollo(server);

  server.use("/api", apiRoutes);

  server.get("*", async (req, res) => {
    const { url } = req;

    const urlCheck = url.replace(/http(s?):\/\/[^\/]*/, "");
    if (urlCheck[0] !== "/") {
      urlCheck = "/" + urlCheck;
    }

    if (urlCheck.startsWith("/_next")) return handle(req, res);
    if (urlCheck.startsWith("/static")) return handle(req, res);
    if (urlCheck.startsWith("/favico")) return handle(req, res);

    const { match, componentName, query } = await componentAndMetadataFromRoute(
      req.url
    );
    if (match) {
      return app.render(req, res, "/" + componentName, query);
    }

    // Defer to the Next framework handler
    return handle(req, res);
  });

  server.listen(process.env.APP_PORT, err => {
    if (err) throw err;
    console.log("> Ready on http://localhost:" + process.env.APP_PORT);
  });
});
