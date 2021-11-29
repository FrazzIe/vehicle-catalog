function init() {
	let tick;
	let cameraHandle;
	let lastVehicle;
	let setOffset = false;
	let updateOffset = false;
	let offsetLength = false;

	function setWeather(weatherType) {
		ClearWeatherTypePersist();
		SetWeatherTypeNowPersist(weatherType);
		SetWeatherTypeNow(weatherType);
		SetWeatherTypePersist(weatherType);
	}

	async function onTick() {
		removeHud();

		setWeather("EXTRASUNNY");
		NetworkOverrideClockTime(12, 0, 0);

		for (let i = 0; i < 2; i++)
			DisableAllControlActions(i);
	}

	async function onSetupImage(data, cb) {
		if (lastVehicle) {
			DeleteEntity(lastVehicle);
			lastVehicle = null;
		}

		await delay(500);

		let model = data.model;
		let [loaded, err] = await loadModel(model);

		if (!loaded) {
			console.log(`${err}, skipping...`);
			return;
		}

		lastVehicle = spawnVehicle(model, config.images.vehicle);

		if (!setOffset || updateOffset) {
			setOffset = true;
			let length = 0;

			if (offsetLength) {
				let dimensions = GetModelDimensions(model);
				length = (dimensions[1][1] - dimensions[0][1]) / 2;
			}

			AttachCamToEntity(cameraHandle, lastVehicle, config.images.offset.attach.x, length + config.images.offset.attach.y, config.images.offset.attach.z, true);
			PointCamAtEntity(cameraHandle, lastVehicle, config.images.offset.point.x, config.images.offset.point.y, config.images.offset.point.z, true);
			await delay(500);
		}

		await delay(500);

		cb("ok");
	}

	async function onEndImage(data, cb) {
		let ped = PlayerPedId();
		let pos = GetEntityCoords(ped);

		if (lastVehicle) {
			DeleteEntity(lastVehicle);
			lastVehicle = null;
		}

		removeCamera(cameraHandle);
		

		if (tick) {
			clearTick(tick);
			tick = null;
		}

		SetFocusPosAndVel(pos[0], pos[1], pos[2], 0.0, 0.0, 0.0);
		setOffset = false;
		updateOffset = false;
		offsetLength = false;

		TriggerServerEvent(`${config.resourceName}:onGenerateEnd`);
		cb("ok");
	}

	async function onGenerateStart(format, _updateOffset, _offsetLength) {
		tick = setTick(onTick);
		cameraHandle = setupCamera();
		SetFocusPosAndVel(config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z, 0.0, 0.0, 0.0);
		RemoveDecalsInRange(config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z, 25.0);
		ClearAreaOfVehicles(config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z, 25.0, false, false, false, false, false);

		if (_updateOffset != null) {
			console.log(_updateOffset)
			if (_updateOffset == "true" || _updateOffset == "1")
				updateOffset = true;
		}

		if (_offsetLength != null) {
			console.log(_offsetLength)
			if (_offsetLength == "true" || _offsetLength == "1")
				offsetLength = true;
		}

		SendNuiMessage(JSON.stringify({
			type: "GenerateVehicleImages", 
			payload: { endpoint: GetCurrentServerEndpoint(), id: GetPlayerServerId(PlayerId()), format: format }
		}));
	}

	RegisterNuiCallbackType("setupImage");
	RegisterNuiCallbackType("endImage");

	on("__cfx_nui:setupImage", onSetupImage);
	on("__cfx_nui:endImage", onEndImage);
	onNet(`${config.resourceName}:onGenerateStart`, onGenerateStart);
}

init();