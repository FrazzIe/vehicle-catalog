import { GameRender } from "./gameview.js";

const resourceName = "GetParentResourceName" in window ? GetParentResourceName() : "unknown";

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

function captureVehicleImage(gameView, vehicle) {
	const imageURL = gameView.canvas.toDataURL("image/png", 0.92);
	const formData = new FormData();

	formData.append("name", vehicle.model);
	formData.append("file", dataURItoBlob(imageURL));

	// upload somewhere
}

async function generateVehicleImages(data) {
	let gameView = GameRender();

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			let isReady = await setupVehicleForImage(data[i][j]);

			if (isReady)
				captureVehicleImage(gameView, data[i][j]);
		}
	}

	gameView.animationFrame = void 0;

	fetch(`https://${resourceName}/endImage`, {
		method: "POST"
	}).then(function(response) {

	}).catch(function(err) {

	})
}

export { generateVehicleImages }