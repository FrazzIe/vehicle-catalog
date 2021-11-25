const fs = require("fs");
const buf = require("buffer");
const path = require("path");

const acceptedMimetypes = {
	"image/png": ".png",
	"image/jpeg": ".jpeg",
}
const outputFolder = "generated_images";

function handler(req, res) {
	if (path.dirname(req.path) != "/upload") {		
		res.writeHead(404);
		res.send("Not found.");
	}

	if (req.method != "POST") {
		res.writeHead(405);
		res.send(`The "${req.method}" method is not allowed`);
	}
	
	if (!req.headers["Content-Type"] || !acceptedMimetypes[req.headers["Content-Type"]]) {
		res.writeHead(415);
		res.send(`Unsupported media type: ${req.headers["Content-Type"]}`);
	}
	
	let fileName = path.basename(req.path);
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