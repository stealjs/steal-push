require("./test_push");
require("./test_preload");

const assert = require("assert");
const stealPush = require("../lib/index.js");

describe("StealPush", function(){
	const StealPush = stealPush.StealPush;

	describe("constructor", function(){
		it("is exported", function(){
			assert.ok(StealPush, "constructor is exported");
		});
	});
});

describe(".create", function(){
	it("exists", function(){
		assert.equal(typeof stealPush.create, "function");
	});
});
