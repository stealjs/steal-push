# steal-push

**steal-push** is server middleware for HTTP2 push. Using steal-tools you can create a **bundle manifest** that species which modules need to be loaded for each *bundle*. steal-push uses this manifest file to push files when a given route is used.

## Install

```
npm install steal-push --save
```

## Setup

Before using steal-push you must generate a [bundle manifest](https://stealjs.com/docs/steal-tools.BuildOptions.html) from steal-tools like so:

```js
stealTools.build(config, {
	bundleManifest: true
});
```

## Usage

steal-push can be used in plain Node web servers, or in express apps.

### Node

```js
const http2 = require("spdy");
const stealPush = require("steal-push");

const pushMain = stealPush("main");
const pushOrders = stealPush("orders");


function app(req, res) {
  if(req.url === "/") {
    pushMain(req, res);
    res.send("<body>Hello world!</body>");
  } else {
    pushOrders(req, res);
    res.send("<body><h1>Orders</h1> ... </body>");
  }
}


spdy.createServer({
  key: fs.readFileSync("path/to/key.pem"),
  cert: fs.readFileSync("path/to/cert.pem"),
  spdy: {
    protocols: ["h2", "http/1.1"]
  }
}, app).listen(8080);

```

### Express

```js
const express = require("express");
const fs = require("fs");
const stealPush = require("steal-push");
const spdy = require("spdy");

const app = express();
const server = spdy.createServer({
  key: fs.readFileSync("path/to/key.pem"),
  cert: fs.readFileSync("path/to/cert.pem"),
  spdy: {
    protocols: ["h2", "http/1.1"]
  }
}, app);

app.get("/",
  stealPush("main"),
  function(req, res){
    // Resources have already been pushed, just send the html
    res.send("<body>Hello world!</body>");
  });

app.get("/order/details",
  stealPush("orders"),
  function(req, res){
    res.send("<body><h1>Orders</h1> ... </body>");
  });

server.listen(8080);
```

### Specifying manifest file

By default steal-push assumes your manifest file is located at `$(pwd)/dist/bundles.json`. If you have moved this manifest file to a different location you can create a new `stealPush` from that root:

```js
var stealPush = require("steal-push").create({
	manifest: __dirname + "/path/to/bundles.json"
});

var push = stealPush("main"); // ...
```

## License

MIT
