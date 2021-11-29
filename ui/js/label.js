const resourceName = "GetParentResourceName" in window ? GetParentResourceName() : false;

let onVehicleLabelsGenerated;

function generateVehicleLabels(data) {
	if (resourceName == false)
		return;
	
	fetch(`https://${resourceName}/getLabels`, {
		method: "POST",
		body: JSON.stringify(data)
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		if (data.error) {
			console.log("Invalid vehicle data was passed to client");
			return;
		}

		if (typeof(data) != "object") {
			console.log("Invalid vehicle label data received from client");
			return;
		}

		if (onVehicleLabelsGenerated)
			onVehicleLabelsGenerated(data);
	}).catch(function(err) {
		console.log(err);
	});
}

function setOnVehicleLabelsGeneratedCallback(callback) {
	onVehicleLabelsGenerated = callback;
}

export { generateVehicleLabels, setOnVehicleLabelsGeneratedCallback }