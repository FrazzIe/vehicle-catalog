import { GameRender } from "./gameview.js";

const resourceName = "GetParentResourceName" in window ? GetParentResourceName() : false;

// from https://stackoverflow.com/a/12300351
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
  
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    const blob = new Blob([ab], { type: mimeString });
    return blob;
}

// from https://stackoverflow.com/a/35033622
function crop(canvas, percentage) {
	let buffer = document.createElement("canvas");
	let ctx = buffer.getContext("2d");

	buffer.width = canvas.width * percentage;
	buffer.height = canvas.height * percentage;

	let offsetX = (canvas.width - buffer.width) / 2;
	let offsetY = (canvas.height - buffer.height) / 2;
	
	ctx.drawImage(canvas, offsetX, offsetY, buffer.width, buffer.height, 0, 0, buffer.width, buffer.height);

	return buffer;	
}

function getMimetypeForImage(format) {
	switch(format) {
		case "png":
			return "image/png";
		case "jpeg":
		case "jpg":
			return "image/jpeg";
		case "webp":
			return "image/webp";
		default:
			return "image/webp";
	}
}

function setupVehicleForImage(vehicle) {
	if (resourceName == false)
		return false;

	return fetch(`https://${resourceName}/setupImage`, {
		method: "POST",
		body: JSON.stringify(vehicle)
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		return data === "ok";
	}).catch(function(err) {
		return false;
	});
}

function captureVehicleImage(payload, gameView, vehicle) {
	const imageType = getMimetypeForImage(payload.format);
	let imageURL;

	if (payload.crop) {
		let percentage = parseFloat(payload.crop);

		if (!isNaN(percentage)) {
			if (percentage > 0.0 && percentage <= 1.0)
				imageURL = crop(gameView.canvas, percentage).toDataURL(imageType, 0.92);
			else
				console.log(`Skipping image crop, percentage is out of bounds (0.0 < ${percentage} <= 1.0`);
		} else
			console.log(`Skipping image crop, "${payload.crop}" is not a number`);
	}

	if (!imageURL)
		imageURL = gameView.canvas.toDataURL(imageType, 0.92);

	const blob = dataURItoBlob(imageURL);

	if (resourceName == false || !payload || !payload.endpoint || !payload.id) {
		console.log("Unable to capture image, resourceName or received payload is malformed");
		return;
	}

	fetch(`https://${payload.endpoint}/${resourceName}/upload/${payload.id}/${vehicle.model}`, {
		method: "POST",
		body: blob
	}).then(function(response) {
		return response.text();
	}).then(function(data) {
		console.log(data);
	}).catch(function(err) {
		console.log(err.message);
	});
}

async function generateVehicleImages(payload, data) {
	if (payload.endpoint && payload.id) {
		let gameView = GameRender();

		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data[i].length; j++) {
				let isReady = await setupVehicleForImage(data[i][j]);

				if (isReady)
					captureVehicleImage(payload, gameView, data[i][j]);
			}
		}

		gameView.stop = true;
	}

	if (resourceName == false)
		return;

	fetch(`https://${resourceName}/endImage`, {
		method: "POST"
	}).then(function(response) {

	}).catch(function(err) {

	})
}

export { generateVehicleImages }