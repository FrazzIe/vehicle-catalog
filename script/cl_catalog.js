function init() {
	let data;
	let tick;
	let cameraHandle;
	let activeModel;
	let entities = [];

	function checkData(_data) {
		if (!_data)
			return [false, "No data received"];
		
		if (!_data.camera)
			return [false, "No camera data received"];
		
		if (!_data.camera.pos || isNaN(_data.camera.pos.x) || isNaN(_data.camera.pos.y) || isNaN(_data.camera.pos.z))
			return [false, "No camera position recieved"];

		if (!_data.camera.rot || isNaN(_data.camera.rot.x) || isNaN(_data.camera.rot.y) || isNaN(_data.camera.rot.z))
			return [false, "No camera rotation received"];

		if (!_data.vehicle || isNaN(_data.vehicle.x) || isNaN(_data.vehicle.y) || isNaN(_data.vehicle.z) || isNaN(_data.vehicle.w))
			return [false, "No vehicle position received"];

		data = _data;

		return [true];
	}

	async function showVehicle(model) {
		while(entities.length) {
			console.log(`"${entities.length}" pop pop`);
			DeleteEntity(entities.pop());
		}

		let [loaded, err] = await loadModel(model);

		if (!loaded) {
			console.log(`${err}, skipping...`);
			return;
		}

		if (activeModel != model) {
			console.log(`"${model}" is no longer active, unloading..`)
			SetModelAsNoLongerNeeded(model);
			return;
		}

		let handle = CreateVehicle(model, data.vehicle.x, data.vehicle.y, data.vehicle.z, data.vehicle.w, false, false);
		FreezeEntityPosition(handle, true);
		SetVehicleOnGroundProperly(handle);
		SetEntityCollision(handle, false, true);
		SetModelAsNoLongerNeeded(model);

		if (activeModel != model) {
			console.log(`"${model}" is no longer active, deleting..`)
			DeleteEntity(handle);
			return;
		}

		entities.push(handle);
	}

	function onTick() {
		removeHud();
	}

	function onOpen(_data) {
		let [success, err] = checkData(_data);

		if (!success) {
			console.log("%s, unable to open.", err);
			return;
		}

		tick = setTick(onTick);
		cameraHandle = setupCamera(data.camera);
		SetNuiFocus(true, true);

		SendNuiMessage(JSON.stringify({
			type: "Show",
			payload: true
		}));
	}
	
	function onClose(data, cb) {
		removeCamera(cameraHandle);

		if (tick) {
			clearTick(tick);
			tick = null;
		}

		SetNuiFocus(false, false);

		cb("ok");
	}
	
	function onIndexChanged(data, cb) {
		activeModel = data.model;
		showVehicle(data.model);
		cb("ok");
	}
	
	RegisterNuiCallbackType("close");
	RegisterNuiCallbackType("indexChanged");
	
	on("__cfx_nui:close", onClose);
	on("__cfx_nui:indexChanged", onIndexChanged);
}

init();