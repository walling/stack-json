var stackJSON = exports;
var chain = require('stack-chain');
var pkgLookup = require('package-lookup');
var path = require('path');

// Whenever the stackJSON property is accessed on an error object, we force a regular stack trace, which will in the end add the stackJSON property.
Object.defineProperty(Error.prototype, 'stackJSON', {
	get: function() {
		// Force stack trace to be generated.
		this.stack;

		// return the newly created JSON stack trace - this is on the object, not the prototype.
		return this.stackJSON;
	}
});

// Default package info for Node.JS core.
var nodePackageJSON = {
	name : 'node',
	version : process.version.replace('v', '')
};

// Actual conversion from stack frames to JSON.
stackJSON._convertFramesToJSON = function(frames) {
	return frames.map(function(frame) {
		var fullFilename = frame.getFileName();
		var filename = fullFilename;

		// Find package info or the Node.JS core info. Also scope the filename to be within the given package.
		var pkg;
		var pkgType;
		if (/^\//.test(fullFilename)) {
			pkg = pkgLookup.resolve(fullFilename) || {};
			pkgType = /\/node_modules\//.test(fullFilename) ? 'lib' : 'main';
			if (pkg._dirname) {
				filename = path.relative(pkg._dirname, fullFilename);
			}
		} else {
			pkg = nodePackageJSON;
			pkgType = 'node';
		}

		// JSON for this stack frame.
		return {
			pkg: pkg,
			pkgType: pkgType,
			fullFilename: fullFilename,
			filename: filename,
			line: frame.getLineNumber(),
			column: frame.getColumnNumber(),
			functionName: frame.getFunction().name || null
		};
	});
};

// Whenever a stack trace is requested, we also generate a JSON stack trace and add it to the error object.
chain.extend.attach(function(error, frames) {
	// Add stackJSON property.
	Object.defineProperty(error, 'stackJSON', {
		value: {
			frames: stackJSON._convertFramesToJSON(frames)
		}
	});
	// Do nothing with the regular stack trace.
	return frames;
});
