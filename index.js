var fs = require("fs");
var memoize = require("lodash.memoize");
var path = require("path");
var zlib = require("zlib");

var noop = () => {};

var getManifest = memoize(function(pth){
	var data = fs.readFileSync(pth, "utf8");
	return JSON.parse(data);
});

function create({manifest: manifestPath, cwd = process.cwd()}) {
	return function(moduleName){
		var manifest = getManifest(manifestPath);
		var assets = manifest[moduleName];

		if(!assets) {
			throw new Error(`${moduleName} is not in the manifest file.`);
		}

		assets = makeIterable(assets);

		return function(req, res, next = noop){
			if(typeof req.push !== "function") {
				return next();
			}

			for(let [pth, asset] of assets) {
				let readStream = fs.createReadStream(
					path.join(cwd, pth)
				);
				let serverPath = `/${pth}`;

				switch(asset.type) {
					case "script":
						pushScript(res, readStream, serverPath);
						break;
					case "style":
						pushStyle(res, readStream, serverPath);
						break;
					default:
						// What do? not push for now
						return next();
				}
			}

			next();
		};
	};
}

function makeIterable(obj) {
	var keys = Object.keys(obj);
	obj[Symbol.iterator] = function*(){
		for(let key of keys) {
			yield [key, obj[key]];
		}
	};
	return obj;
}

function pushScript(res, inputStream, pth){
	var outStream = res.push(pth, {
		status: 200,
		method: "GET",
		request: { accept: "*/*" },
		response: {
			"content-encoding": "gzip",
			"content-type": "application/javascript"
		}
	});

	return inputStream
		.pipe(zlib.createGzip())
		.pipe(outStream);
}

function pushStyle(res, inputStream, pth){
	var outStream = res.push(pth, {
		status: 200,
		method: "GET",
		request: { accept: "*/*" },
		response: {
			"content-type": "text/css"
		}
	});

	return inputStream.pipe(outStream);
}

// Set it up with the defaults
exports = module.exports = create({
	manifest: "dist/bundles"
});

exports.create = create;
