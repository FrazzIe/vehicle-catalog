const fs = require("fs");
const path = require("path");

const acceptedFileTypes = {
	".png": "image/png",
	".jpeg": "image/jpeg",
	".webp": "image/webp"	
}

const resourceName = GetCurrentResourceName();
const cachedFiles = {};
let imageFolder = "images";
let defaultName = "default";
let defaultExt = ".webp";
let allowGet = true;

function handleError(imageDirectory, req, res) {
	let fileName = defaultName + defaultExt;

	if (cachedFiles[fileName]) {
		res.writeHead(200, { "Content-Type:": acceptedFileTypes[defaultExt] });
		res.send(cachedFiles[fileName]);
		return;
	}

	let filePath = path.join(imageDirectory, fileName);

	fs.readFile(filePath, function(error, data) {
		if (error) {
			res.writeHead(404);
			res.send("Not found.");
			return;
		}

		cachedFiles[fileName] = data.buffer;
		res.writeHead(200, { "Content-Type:": acceptedFileTypes[defaultExt] });
		res.send(data.buffer);
	});
}

function handleGet(req, res) {
	req.path = path.normalize(req.path);
	const pathParams = req.path.split(path.sep);

	if (pathParams.length != 3) {
		res.writeHead(400);
		res.send("Invalid route");
		return;
	}

	if (pathParams[0] != "" && pathParams[1] != "images") {		
		res.writeHead(404);
		res.send("Not found.");
		return;
	}

	let fileName = pathParams[2];
	let fileExt = path.extname(fileName);

	if (!acceptedFileTypes[fileExt]) {
		res.writeHead(415);
		res.send(`Unsupported media type: ${fileExt}`);
		return;
	}

	if (cachedFiles[fileName]) {
		res.writeHead(200, { "Content-Type:": acceptedFileTypes[fileExt] });
		res.send(cachedFiles[fileName]);
		return;
	}

	let imageDirectory = path.join(GetResourcePath(resourceName), imageFolder);
	let filePath = path.join(imageDirectory, fileName);

	fs.readFile(filePath, function(error, data) {
		if (error)
			return handleError(imageDirectory, req, res);

		cachedFiles[fileName] = data.buffer;
		res.writeHead(200, { "Content-Type:": acceptedFileTypes[fileExt] });
		res.send(data.buffer);
	});
}

function handler(req, res) {
	if (req.method == "GET" && allowGet)
		handleGet(req, res);
	else {
		res.writeHead(405);
		res.send(`The "${req.method}" method is not allowed`);
		return;
	}
}

module.exports = function(data) {
	defaultName = data.image.default.fileName;
	defaultExt = data.image.default.fileType;
	allowGet = data.image.server;

	if (!data.image.server)
		imageFolder = path.join("ui", "img");

	return { handler };
}