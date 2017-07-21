const assert = require("assert");
const merge = require("merge-stream");
const through = require("through2");
const sp = require("../lib/index.js");
const Writable = require("stream").Writable;

require("./get_bundle_test");

describe("Basics", function(){
	var stealPush = sp.create({
		manifest: __dirname + "/tests/basics/bundles.json",
		cwd: __dirname + "/tests/basics"
	});

	var push = stealPush("index");

	it("works", function(){
		var req = through(() => {});
		var res = through(() => {});

		var pushes = [];
		res.push = function(pth, options){
			var p = through((a, b, cb) => cb());
			pushes.push(p);
			return p;
		};

		push(req, res);

		assert.equal(pushes.length, 2, "There are pushes for style and script");
	});
});
