var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
const https = require("https");
const path = require("path");
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var categoryRouter = require("./router/categoryrouter");
var itemRouter = require("./router/itemrouter");
var levelRouter = require("./router/levelrouter");
var invoiceRouter = require("./router/invoicerouter");
var generalRouter = require("./router/generalrouter");
var routeRouter = require("./router/routesroute");
var voucherRoute = require("./router/voucherroute");
var ledgerRoute = require("./router/ledgerrouter");
var stockRoute = require("./router/stockrouter");
var itemLedgerRoute = require("./router/itemledgerrouter");
var reportRoute = require("./router/reportRouter");
var locationwiserouter = require("./router/locationwiserouter");

app.use("/api", categoryRouter);
app.use("/api", itemRouter);
app.use("/api", levelRouter);
app.use("/api", invoiceRouter);
app.use("/api", generalRouter);
app.use("/api", routeRouter);
app.use("/api", voucherRoute);
app.use("/api", ledgerRoute);
app.use("/api", stockRoute);
app.use("/api", stockRoute);
app.use("/api", itemLedgerRoute);
app.use("/api", reportRoute);
app.use("/api", locationwiserouter);
app.get("/", (req, res) => {
  res.send("Hello World");
});
const PORT = 8000;
https
  .createServer(
    {
      key: fs.readFileSync(path.join(__dirname, "router", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "router", "cert.pem")),
      passphrase: "sslkey",
    },
    app
  )
  .listen(PORT);
