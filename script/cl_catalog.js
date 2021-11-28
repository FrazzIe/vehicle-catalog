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

		let handle = CreateVehicle(model, data.vehicle.x, data.vehicle.y, data.vehicle.z, data.vehicle.w, false, false);
		FreezeEntityPosition(handle, true);
		SetVehicleOnGroundProperly(handle);
		SetEntityCollision(handle, false, true);
		SetModelAsNoLongerNeeded(model);

		if (activeModel != model) {
			console.log(`"${model}" is no longer active, deleting..`);
			DeleteEntity(handle);
			return;
		}

		entities.push(handle);

		if (!setOffset || data.updateOffset) {
			setOffset = true;
			AttachCamToEntity(cameraHandle, handle, data.offset.attach.x, data.offset.attach.y, data.offset.attach.z, true);
			PointCamAtEntity(cameraHandle, handle, data.offset.point.x, data.offset.point.y, data.offset.point.z, true);
		}
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
		cameraHandle = setupCamera();
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
	
	on("__cfx_nui:close", onClose);
	on("__cfx_nui:indexChanged", onIndexChanged);
}

init();