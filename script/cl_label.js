function onGetLabels(data, cb) {
	let labels = {};

	if (data == null) {
		cb({ error: true });
		return;
	}

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			let vehicle = data[i][j];

			if (vehicle && vehicle.model) {
				let name = GetDisplayNameFromVehicleModel(vehicle.model);
				let text = GetLabelText(name);

				labels[vehicle.model] = text;
			}
		}
	}

	cb(labels);
}

RegisterNuiCallbackType("getLabels");

on("__cfx_nui:getLabels", onGetLabels);