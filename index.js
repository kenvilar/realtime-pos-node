var express = require("express");
var http = require("http");
var port = 80;
var app = require("express")();
var server = http.createServer(app);
var bodyParser = require("body-parser");
var io = require("socket.io")(server);
var liveCart;

console.log("POS running!");
console.log("Server started!");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept,X-Access-Token,X-Key"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

app.get("/", function (req, res) {
  res.send("POS web app running!");
});

app.use("/api/inventory", require("./api/inventory"));
app.use("/api", require("./api/transactions"));

// Websocket logic for Live Cart
io.on("connection", function (socket) {
  socket.on("cart-transaction-complete", function () {
    socket.broadcast.emit("update--live-cart-display", {});
  });

  // onpageload, show user current cart
  socket.on("live-cart-page-loaded", function () {
    socket.emit("update-live-cart-display", liveCart);
  });

  // when client is connected, make the client update live cart
  socket.emit("update-live-cart-display", liveCart);

  // when the cart data is updated by the POS
  socket.on("update-live-cart", function (cartData) {
    liveCart = cartData;

    // broadcast updated live cart to all websocket clients
    socket.broadcast.emit("update-live-cart-display", liveCart);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
