function init() {
	let data;
	let tick;
	let cameraHandle;

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
	
	}
	
	RegisterNuiCallbackType("close");
	RegisterNuiCallbackType("indexChanged");
	
	on("__cfx_nui:close", onClose);
	on("__cfx_nui:indexChanged", onIndexChanged);
}

init();