function init() {
	let tick;
	let cameraHandle;
	let lastVehicle;

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
		SetFocusPosAndVel(pos[0], pos[1], pos[2], 0.0, 0.0, 0.0);

		if (tick) {
			clearTick(tick);
			tick = null;
		}

		TriggerServerEvent(`${config.resourceName}:onGenerateEnd`);
		cb("ok");
	}

	async function onGenerateStart(format) {
		tick = setTick(onTick);
		cameraHandle = setupCamera(config.images.camera);
		SetFocusPosAndVel(config.images.vehicle.x, config.images.vehicle.y, config.images.vehicle.z, 0.0, 0.0, 0.0);
		RemoveDecalsInRange(config.images.camera.pos.x, config.images.camera.pos.y, config.images.camera.pos.z, 25.0);
		ClearAreaOfVehicles(config.images.camera.pos.x, config.images.camera.pos.y, config.images.camera.pos.z, 25.0, false, false, false, false, false);

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