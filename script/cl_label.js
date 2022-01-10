function onGetLabels(data, cb) {
	const labels = {};

	if (data == null) {
		cb({ error: true });
		return;
	}

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			const vehicle = data[i][j];

			if (vehicle != null && vehicle.model != null) {
				const name = GetDisplayNameFromVehicleModel(vehicle.model);
				const text = GetLabelText(name);

				labels[vehicle.model] = text;
			}
		}
	}

	cb(labels);
}

RegisterNuiCallbackType("getLabels");

on("__cfx_nui:getLabels", onGetLabels);