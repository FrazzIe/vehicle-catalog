function init() {
	let data;
	let tick;
	let cameraHandle;
	let activeModel;
	let entities = [];
	let setOffset = false;

	function checkData(_data) {
		if (!_data)
			return [false, "No data received"];

		if (!_data.vehicle || isNaN(_data.vehicle.x) || isNaN(_data.vehicle.y) || isNaN(_data.vehicle.z) || isNaN(_data.vehicle.w))
			return [false, "No vehicle position received"];

		if (!_data.offset)
			return [false, "No offsets received"];

		if (!_data.offset.attach || isNaN(_data.offset.attach.x) || isNaN(_data.offset.attach.y) || isNaN(_data.offset.attach.z))
			return [false, "No attach offset position received"];

		if (!_data.offset.point || isNaN(_data.offset.point.x) || isNaN(_data.offset.point.y) || isNaN(_data.offset.point.z))
			return [false, "No point offset position received"];

		if (!_data.updateOffset)
			_data.updateOffset = false;

		if (!_data.offsetLength)
			_data.offsetLength = false;

		if (!_data.showPrice)
			_data.showPrice = false;

		data = _data;

		return [true];
	}

	async function showVehicle(model) {
		while(entities.length) {
			DeleteEntity(entities.pop());
		}

		let [loaded, err] = await loadModel(model);

		if (!loaded) {
			console.log(`${err}, skipping...`);
			return;
		}

		if (activeModel != model) {
			console.log(`"${model}" is no longer active, unloading..`);
			SetModelAsNoLongerNeeded(model);
			return;
		}

		let handle = spawnVehicle(model, data.vehicle);

		if (activeModel != model) {
			console.log(`"${model}" is no longer active, deleting..`);
			DeleteEntity(handle);
			return;
		}

		entities.push(handle);

		if (!setOffset || data.updateOffset) {
			setOffset = true;
			let length = 0;

			if (data.offsetLength) {
				let dimensions = GetModelDimensions(model);
				length = (dimensions[1][1] - dimensions[0][1]) / 2;
			}

			AttachCamToEntity(cameraHandle, handle, data.offset.attach.x, length + data.offset.attach.y, data.offset.attach.z, true);
			PointCamAtEntity(cameraHandle, handle, data.offset.point.x, data.offset.point.y, data.offset.point.z, true);
		}
	}

	function onTick() {
		removeHud();
	}

	async function onInit(resourceName) {
		if (config.resourceName != resourceName)
			return;

		await delay(1000);

		let onServerInit;

		onServerInit = function(url) {
			let endpoint = url == "" ? getServerEndpoint() : url;
			
			SendNuiMessage(JSON.stringify({
				type: "Init",
				payload: { endpoint: endpoint }
			}));

			removeEventListener(`${config.resourceName}:onInit`, onServerInit);
			emit(`${config.resourceName}:onInit`);			
		}

		onNet(`${config.resourceName}:onInit`, onServerInit);
		emitNet(`${config.resourceName}:onInit`);
	}

	function onOpen(_data) {
		let [success, err] = checkData(_data);

		if (!success) {
			console.log("%s, unable to open.", err);
			return;
		}

		tick = setTick(onTick);
		cameraHandle = setupCamera();
		SetNuiFocus(true, true);
		SetFocusPosAndVel(data.vehicle.x, data.vehicle.y, data.vehicle.z, 0.0, 0.0, 0.0);

		SendNuiMessage(JSON.stringify({
			type: "Show",
			payload: { visible: true, showPrice: data.showPrice }
		}));
	}
	
	function onClose(data, cb) {
		let ped = PlayerPedId();
		let pos = GetEntityCoords(ped);

		removeCamera(cameraHandle);

		if (tick) {
			clearTick(tick);
			tick = null;
		}

		SetNuiFocus(false, false);
		SetFocusPosAndVel(pos[0], pos[1], pos[2], 0.0, 0.0, 0.0);
		setOffset = false;

		cb("ok");
	}
	
	function onIndexChanged(data, cb) {
		if (data.error) {
			cb("error");
			return;
		}

		activeModel = data.model;
		showVehicle(data.model);
		cb("ok");
	}
	
	RegisterNuiCallbackType("close");
	RegisterNuiCallbackType("indexChanged");
	
	on("onClientResourceStart", onInit);
	on("__cfx_nui:close", onClose);
	on("__cfx_nui:indexChanged", onIndexChanged);
}

init();