const assert = require("assert");
const merge = require("merge-stream");
const through = require("through2");
const sp = require("../lib/index.js");
const Writable = require("stream").Writable;

describe("Basics", function(){
	var stealPush = sp.create({
		manifest: __dirname + "/tests/basics/bundles.json",
		cwd: __dirname + "/tests/basics"
	});

	var push = stealPush("index");

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
