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
	const imageURL = gameView.canvas.toDataURL(imageType, 0.92);
	const blob = dataURItoBlob(imageURL);
	const id = payload.id;
	let serverEndpoint = payload.endpoint;
	
	//hacky fix for a locally hosted server with a local client
	let pattern = /(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/;
	let endpoint = serverEndpoint.split(':');
	if (pattern.test(endpoint[0]))
		serverEndpoint = `127.0.0.1:${endpoint[1]}`;

	if (resourceName == false)
		return;

	fetch(`http://${serverEndpoint}/${resourceName}/upload/${id}/${vehicle.model}`, {
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