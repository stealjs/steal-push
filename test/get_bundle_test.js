var assert = require("assert");
var getBundle = require("../lib/get_bundle");

describe("get_bundle", function(){
	var orderAssets = {
		"dist/bundles/app/orders/orders":{}
	};

	var manifest = {
		"app@1.0.0#orders/orders": orderAssets
	};

	var variations = [
		"app@1.0.0#orders/orders",
		"app/orders/orders",
		"app/orders/",
		"orders/",
		"orders/orders"
	];

	it("All variations resolve correctly", function(){
		variations.forEach(function(v){
			var assets = getBundle(manifest, v);

			assert.equal(assets, orderAssets, `${v} did not resolve`);
		});
	});

});
