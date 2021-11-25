import { GameRender } from "./gameview.js";

const resourceName = "GetParentResourceName" in window ? GetParentResourceName() : "unknown";

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

function setupVehicleForImage(vehicle) {
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

function captureVehicleImage(serverEndpoint, gameView, vehicle) {
	const imageURL = gameView.canvas.toDataURL("image/png", 0.92);
	const formData = new FormData();

	formData.append("name", vehicle.model);
	formData.append("file", dataURItoBlob(imageURL));

	// upload somewhere
}

async function generateVehicleImages(serverEndpoint, data) {
	let gameView = GameRender();

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			let isReady = await setupVehicleForImage(data[i][j]);

			if (isReady)
				captureVehicleImage(serverEndpoint, gameView, data[i][j]);
		}
	}

	gameView.stop = true;

	fetch(`https://${resourceName}/endImage`, {
		method: "POST"
	}).then(function(response) {

	}).catch(function(err) {

	})
}

export { generateVehicleImages }