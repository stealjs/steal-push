# steal-push

**steal-push** is server middleware for HTTP2 push. Using steal-tools you can create a **bundle manifest** that species which modules need to be loaded for each *bundle*. steal-push uses this manifest file to push files when a given route is used.

## Install

```
npm install steal-push --save
```

## Usage

steal-push can be used in plain Node web servers, or in express apps.

### Node

### Express

```js
const express = require("express");
const stealPush = require("steal-push");

const app = express();

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
```

## License

MIT
