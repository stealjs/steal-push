var fs = require("fs");
var memoize = require("lodash.memoize");
var normalize = require("steal-fuzzy-normalize");
var path = require("path");
var zlib = require("zlib");

var noop = () => {};

var getManifest = memoize(function(pth){
	var data = fs.readFileSync(pth, "utf8");
	return JSON.parse(data);
});

class StealPush {
	constructor(options = {}) {
		this.manifestPath = options.manifest;
		this.serverRoot = options.serverRoot || "/";
		this.root = options.root || process.cwd();
	}

	for(moduleIdentifier){
		const manifest = getManifest(this.manifestPath);
		const serverRoot = this.serverRoot;
		const root = this.root;
		let assets = normalize(moduleIdentifier, manifest);

		if(!assets) {
			throw new Error(`${moduleIdentifier} is not in the manifest file.`);
		}

		assets = makeIterable(assets);

		return function(req, res, next = noop){
			if(!isHTTP2(res)) {
				let headers = [];

				for(let [pth, asset] of assets) {
					let serverPath = path.join(serverRoot, pth);

					switch(asset.type) {
						case "script":
							headers.push(
								`<${serverPath}>; rel=preload; as=script;`
							);
							break;
						case "style":
							headers.push(
								`<${serverPath}>; rel=preload; as=style;`
							);
							break;
						default:
							return next();
					}
				}

				if(headers.length) {
					res.setHeader("Link", headers);
				}
			} else {
				for(let [pth, asset] of assets) {
					let readStream = fs.createReadStream(
						path.join(root, pth)
					);
					let serverPath = path.join(serverRoot, pth);

					switch(asset.type) {
						case "script":
							pushScript(req, res, readStream, serverPath);
							break;
						case "style":
							pushStyle(req, res, readStream, serverPath);
							break;
						default:
							// What do? not push for now
							return next();
					}
				}
			}
		};
	}
}

function create(options) {
	var stealPush = new StealPush(options);

	return function(moduleIdentifier){
		return stealPush.for(moduleIdentifier);
	}
}

function isHTTP2(response) {
	return typeof response.push === "function";
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

function pushScript(req, res, inputStream, pth){
	var encoding = req.headers["accept-encoding"] || "";
	var acceptsGzip = !!encoding.split(",").filter(function(enc){
		return enc.trim() === "gzip";
	}).length;

	var response = {
		"content-type": "application/javascript"
	};

	if(acceptsGzip) {
		response["content-encoding"] = "gzip";
	}

	var outStream = res.push(pth, {
		status: 200,
		method: "GET",
		request: { accept: "*/*" },
		response: response
	});

	var stream = inputStream;

	if(acceptsGzip) {
		stream = inputStream.pipe(zlib.createGzip());
	}

	return stream.pipe(outStream);
}

function pushStyle(req, res, inputStream, pth){
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
exports = module.exports = new StealPush({
	manifest: "dist/bundles.json"
});

exports.StealPush = StealPush;
exports.create = create;
