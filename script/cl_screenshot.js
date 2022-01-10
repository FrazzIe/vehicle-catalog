const screenshot = {
	tick: null,
	camera: null,
	vehicle: null,
	marker: false,
	offset: {
		set: false,
		update: false,
		length: false
	}
}

function setWeather(weatherType) {
	ClearWeatherTypePersist();
	SetWeatherTypeNowPersist(weatherType);
	SetWeatherTypeNow(weatherType);
	SetWeatherTypePersist(weatherType);
}

async function onScreenshotTick() {
	removeHud();

	setWeather("EXTRASUNNY");
	NetworkOverrideClockTime(12, 0, 0);

	for (let i = 0; i < 2; i++)
		DisableAllControlActions(i);

	if (screenshot.marker)
		DrawMarker(config.images.marker.type, config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z + config.images.marker.offsetZ, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, config.images.marker.scale.x, config.images.marker.scale.y, config.images.marker.scale.z, config.images.marker.color.r, config.images.marker.color.g, config.images.marker.color.b, config.images.marker.color.a, false, true);
}

async function onSetupImage(data, cb) {
	if (screenshot.vehicle != null) {
		DeleteEntity(screenshot.vehicle);
		screenshot.vehicle = null;
	}

	await delay(500);

	if (data.default) {
		screenshot.marker = true;
		await delay(500);
		cb("ok");
		return;
	}

	let model = data.model;
	let [loaded, err] = await loadModel(model);

	if (!loaded) {
		console.log(`${err}, skipping...`);
		return;
	}

	screenshot.vehicle = spawnVehicle(model, config.images.vehicle);

	if (screenshot.offset.set == false || screenshot.offset.update == true) {
		screenshot.offset.set = true;
		let length = 0;

		if (screenshot.offset.length) {
			let dimensions = GetModelDimensions(model);
			length = (dimensions[1][1] - dimensions[0][1]) / 2;
		}

		AttachCamToEntity(screenshot.camera, lastVehicle, config.images.offset.attach.x, length + config.images.offset.attach.y, config.images.offset.attach.z, true);
		PointCamAtEntity(screenshot.camera, lastVehicle, config.images.offset.point.x, config.images.offset.point.y, config.images.offset.point.z, true);
		await delay(500);
	}

	await delay(500);

	cb("ok");
}

async function onEndImage(data, cb) {
	let ped = PlayerPedId();
	let pos = GetEntityCoords(ped);

	if (screenshot.vehicle != null) {
		DeleteEntity(screenshot.vehicle);
		screenshot.vehicle = null;
	}

	removeCamera(screenshot.camera);

	if (screenshot.tick != null) {
		clearTick(screenshot.tick);
		screenshot.tick = null;
	}

	SetFocusPosAndVel(pos[0], pos[1], pos[2], 0.0, 0.0, 0.0);

	screenshot.offset.set = false;
	screenshot.offset.update = false;
	screenshot.offset.length = false;
	screenshot.marker = false;

	TriggerServerEvent(`${config.resourceName}:onGenerateEnd`);
	cb("ok");
}

async function onGenerateStart(format, updateOffset, offsetLength, crop) {
	screenshot.tick = setTick(onScreenshotTick);
	screenshot.camera = setupCamera();

	SetFocusPosAndVel(config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z, 0.0, 0.0, 0.0);
	RemoveDecalsInRange(config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z, 25.0);
	ClearAreaOfVehicles(config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z, 25.0, false, false, false, false, false);

	if (updateOffset != null) {
		if (updateOffset == "true" || updateOffset == "1") {
			screenshot.offset.update = true;
		}
	}

	if (offsetLength != null) {
		if (offsetLength == "true" || offsetLength == "1") {
			screenshot.offset.length = true;
		}
	}

	SendNuiMessage(JSON.stringify({
		type: "GenerateVehicleImages", 
		payload: { id: GetPlayerServerId(PlayerId()), format: format, crop: crop }
	}));
}

RegisterNuiCallbackType("setupImage");
RegisterNuiCallbackType("endImage");

on("__cfx_nui:setupImage", onSetupImage);
on("__cfx_nui:endImage", onEndImage);
onNet(`${config.resourceName}:onGenerateStart`, onGenerateStart);