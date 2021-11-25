import { GameRender } from "./gameview.js";

const resourceName = "GetParentResourceName" in window ? GetParentResourceName() : "unknown";

async function setupVehicleForImage(vehicle) {
	const result = await fetch(`http://${resourceName}/setupImage`, {
		method: "POST",
		body: JSON.stringify(vehicle)
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		return data === "ok";
	});

	return result;
}

function captureVehicleImage(gameView, vehicle) {
	const imageURL = gameView.canvas.toDataURL("image/png", 0.92);
	const formData = new FormData();

	formData.append("name", vehicle.model);
	formData.append("file", dataURItoBlob(imageURL));

	// upload somewhere
}

function generateVehicleImages(data) {
	let gameView = GameRender();

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			let isReady = setupVehicleForImage(data[i][j]);

			if (isReady)
				captureVehicleImage(gameView, vehicle);
		}
	}

	gameView.animationFrame = void 0;

	fetch(`http://${resourceName}/endImage`, {
		method: "POST"
	}).then(function(response) {

	}).catch(function(err) {

	})
}

export { generateVehicleImages }