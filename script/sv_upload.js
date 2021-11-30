const fs = require("fs");
const buf = require("buffer");
const path = require("path");
const data = require("./vehicles.json");

const acceptedMimetypes = {
	"image/png": ".png",
	"image/jpeg": ".jpeg",
	"image/webp": ".webp"
}
const acceptedFileTypes = {
	".png": "image/png",
	".jpeg": "image/jpeg",
	".webp": "image/webp"	
}
const imageFolder = "images";
const accessControl = {};
const resourceName = GetCurrentResourceName();
const cachedFiles = {};

function handlePost(req, res) {
	req.path = path.normalize(req.path);
	const pathParams = req.path.split(path.sep);

	if (pathParams.length != 4) {
		res.writeHead(400);
		res.send("Invalid route");
		return;
	}

	if (pathParams[0] != "" && pathParams[1] != "upload") {		
		res.writeHead(404);
		res.send("Not found.");
		return;
	}

	if (!accessControl[pathParams[2]]) {
		res.writeHead(401);
		res.send("401 Unauthorized");
		return;
	}
	
	if (!req.headers["Content-Type"] || !acceptedMimetypes[req.headers["Content-Type"]]) {
		res.writeHead(415);
		res.send(`Unsupported media type: ${req.headers["Content-Type"]}`);
		return;
	}
	
	let fileName = pathParams[3];
	let fileExt = acceptedMimetypes[req.headers["Content-Type"]];
	let filePath = path.join(GetResourcePath(resourceName), imageFolder, fileName + fileExt);

	req.setDataHandler(async function(body) {
		const blob = new buf.Blob([body], {
			type: req.headers["Content-Type"]
		});

		const buffer = buf.Buffer.from(await blob.arrayBuffer());

		fs.mkdir(path.dirname(filePath), { recursive: true }, function(error) {
			if (error) {
				console.log(error);
				return;
			}

			fs.writeFile(filePath, buffer, function(error) {
				if (error) {
					console.log(error);
					return;
				}

				console.log(`Image stored: ${filePath}`);

				res.writeHead(200);
				res.send("ok");
			});
		});
	}, "binary");
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

	let filePath = path.join(GetResourcePath(resourceName), imageFolder, fileName);

	fs.readFile(filePath, function(error, data) {
		if (error) {
			console.log(error);
			res.writeHead(404);
			res.send("Not found.");
			return;
		}

		cachedFiles[fileName] = data.buffer;
		res.writeHead(200, { "Content-Type:": acceptedFileTypes[fileExt] });
		res.send(data.buffer);
	})
}

// TODO: Allow image GET request w/ caching?
function handler(req, res) {
	if (req.method == "POST")
		handlePost(req, res);
	else if(req.method == "GET")
		handleGet(req, res);
	else {
		res.writeHead(405);
		res.send(`The "${req.method}" method is not allowed`);
		return;
	}
}

function onGenerateCmd(src, args) {
	if (src == 0)
		return;
	
	accessControl[src] = true;

	emitNet(`${resourceName}:onGenerateStart`, src, args[0], args[1], args[2], args[3]);
}

function onGenerateEnd() {
	const src = global.source;

	delete accessControl[src];
}

function onInit() {
	const src = global.source;
	emitNet(`${resourceName}:onInit`, src, GetConvar("web_baseUrl", ""))
}

SetHttpHandler(handler);
RegisterCommand("vc_gvi", onGenerateCmd);
RegisterCommand("vc_generate_vehicle_images", onGenerateCmd);
onNet(`${resourceName}:onGenerateEnd`, onGenerateEnd);
onNet(`${resourceName}:onInit`, onInit);