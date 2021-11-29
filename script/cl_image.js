function init() {
	let tick;
	let cameraHandle;
	let lastPed;
	let lastPedCoords;
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

		lastVehicle = spawnVehicle(config.images.vehicle);

		await delay(500);

		cb("ok");
	}

	async function onEndImage(data, cb) {
		if (lastVehicle) {
			SetEntityCoords(lastVehicle, -4000.0, -4000.0, -4000.0);
			SetEntityAsMissionEntity(lastVehicle, false, true);
			DeleteVehicle(lastVehicle);

			lastVehicle = null;
		}

		if (lastPed) {
			SetEntityCoords(lastPed, lastPedCoords.x, lastPedCoords.y, lastPedCoords.z);
			ResetEntityAlpha(lastPed);
			FreezeEntityPosition(lastPed, false);
		}

		removeCamera(cameraHandle);

		if (tick) {
			clearTick(tick);
			tick = null;
		}

		TriggerServerEvent(`${config.resourceName}:onGenerateEnd`);
		cb("ok");
	}

	async function onGenerateStart(format) {
		tick = setTick(onTick);
		
		lastPed = PlayerPedId();
		lastPedCoords = GetEntityCoords(lastPed);
		SetEntityCoords(lastPed, config.images.camera.pos.x, config.images.camera.pos.y, config.images.camera.pos.z);
		FreezeEntityPosition(lastPed, true);
		SetEntityAlpha(lastPed, 0);

		cameraHandle = setupCamera(config.images.camera);

		let interior = GetInteriorAtCoords(config.images.camera.pos.x, config.images.camera.pos.y, config.images.camera.pos.z);

		if (interior != 0) {
			PinInteriorInMemory(interior)
			while (!IsInteriorReady(interior)) {
				await delay(200);
			}
		}

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