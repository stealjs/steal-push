const assert = require("assert");
const merge = require("merge-stream");
const through = require("through2");
const sp = require("../lib/index.js");
const Writable = require("stream").Writable;

describe("Preload", function(){
	var stealPush = sp.create({
		manifest: __dirname + "/tests/basics/bundles.json",
		root: __dirname + "/tests/basics"
	});

	var push = stealPush("index");

	it("works", function(){
		var req = through(() => {});
		req.headers = {
			"accept-encoding": "gzip, deflate, br"
		};
		var res = through(() => {});
		res.push = undefined;

		var headers = {}
		res.setHeader = (name, val) => {
			headers[name.toLowerCase()] = val;
		};

		push(req, res);

		var pushes = headers.link;
		assert.equal(pushes.length, 2, "There are preloads for style and script");
	});
});
