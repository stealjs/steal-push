const assert = require("assert");
const merge = require("merge-stream");
const through = require("through2");
const StealPush = require("../lib/index.js").StealPush;
const Writable = require("stream").Writable;

describe("PUSH", function(){
	var stealPush = new StealPush({
		manifest: __dirname + "/tests/basics/bundles.json",
		root: __dirname + "/tests/basics"
	});

	var push = stealPush.for("index");

	it("works", function(){
		var req = through(() => {});
		req.headers = {
			"accept-encoding": "gzip, deflate, br"	
		};
		var res = through(() => {});

		var pushes = [];
		res.push = function(pth, options){
			var p = through((a, b, cb) => cb());
			pushes.push(p);
			return p;
		};

		debugger;

		push(req, res);

		assert.equal(pushes.length, 2, "There are pushes for style and script");
	});

	it("does not gzip content if header doesn't specify", function(done){
		var req = through(() => {});
		req.headers = {
			"accept-encoding": "deflate, br"	
		};
		var res = through(() => {});

		var pushes = [];
		res.push = function(pth, options){
			var p = through((buf, enc, cb) => {
				// If a javascript result
				if(/\.js/.test(pth)) {
					var js = buf.toString();
					assert.ok(/console\.log/.test(js), "This was not gzipped");
					done();
				}
				cb();
			});
			pushes.push(p);
			return p;
		};

		push(req, res);

		assert.equal(pushes.length, 2, "There are pushes for style and script");
	});

});
