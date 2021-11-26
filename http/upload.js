const fs = require("fs");
const buf = require("buffer");
const path = require("path");

const acceptedMimetypes = {
	"image/png": ".png",
	"image/jpeg": ".jpeg",
}
const outputFolder = "generated_images";
const accessControl = {};

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
	let filePath = path.join(GetResourcePath(GetCurrentResourceName()), outputFolder, fileName + fileExt);

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

SetHttpHandler(handler);