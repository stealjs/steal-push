
module.exports = function(manifest, identifier){
	var assets;

	if((assets = manifest[identifier]) !== undefined) {
		return assets;
	}

	var isMatch = id => identifier === id;

	var keys = Object.keys(manifest);
	
	for(let key of keys) {
		let match = findMatch(key, identifier);

		if(match) {
			return manifest[key];
		}
		/*let variations = getVariations(key);

		if(variations.some(isMatch)) {
			return manifest[key];
		}*/
	}
};

var npmModuleRegEx = /@.+\..+\..+#/;

function findMatch(moduleName, identifier) {
	// If it ends in a slash, go ahead and add that on
	if(identifier[identifier.length - 1] === "/") {
		let identifierParts = identifier.split("/");
		identifier += identifierParts[identifierParts.length - 2];
	}

	if(identifier === moduleName) {
		return true;
	}

	// Remove any npm bits
	moduleName = moduleName.replace(npmModuleRegEx, () => "/");

	if(moduleName === identifier) {
		return true;
	}

	// Remove the first part (package name) in case that's not used
	moduleName = moduleName.substr(moduleName.indexOf("/") + 1);

	if(moduleName === identifier) {
		return true;
	}
}
