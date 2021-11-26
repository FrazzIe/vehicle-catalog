const fs = require("fs");
const buf = require("buffer");
const path = require("path");

const acceptedMimetypes = {
	"image/png": ".png",
	"image/jpeg": ".jpeg",
}
const outputFolder = "generated_images";
const accessControl = {};
const resourceName = GetCurrentResourceName();

function handler(req, res) {
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

	if (req.method != "POST") {
		res.writeHead(405);
		res.send(`The "${req.method}" method is not allowed`);
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
	let filePath = path.join(GetResourcePath(resourceName), outputFolder, fileName + fileExt);

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

function onGenerateCmd(src) {
	if (src == 0)
		return;
	
	accessControl[src] = true;

	emitNet(`${resourceName}:onGenerateStart`, src);
}

function onGenerateEnd() {
	const src = global.source;

	delete accessControl[src];
}

SetHttpHandler(handler);
RegisterCommand("vc_gvi", onGenerateCmd);
RegisterCommand("vc_generate_vehicle_images", onGenerateCmd);
onNet(onGenerateEnd);