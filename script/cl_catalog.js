const catalog = {
	data: null,
	tick: null,
	camera: null,
	visible: false,
	offset: false,
	preview: {
		current: null,
		entities: []
	}
}

function isCatalogDataValid(data) {
	if (data == null) {
		return "No data received";
	}

	if (data.vehicle == null || isNaN(data.vehicle.x) == true || isNaN(data.vehicle.y) == true || isNaN(data.vehicle.z) == true || isNaN(data.vehicle.w) == true) {
		return "No vehicle position received";
	}

	if (data.offset == null) {
		return "No offsets received";
	}

	if (data.offset.attach == null || isNaN(data.offset.attach.x) == true || isNaN(data.offset.attach.y) == true || isNaN(data.offset.attach.z) == true) {
		return "No attach offset position received";
	}

	if (data.offset.point == null || isNaN(data.offset.point.x) == true || isNaN(data.offset.point.y) == true || isNaN(data.offset.point.z) == true) {
		return "No point offset position received";
	}

	if (data.updateOffset == null) {
		data.updateOffset = false;
	}		

	if (data.offsetLength == null) {
		data.offsetLength = false;
	}

	if (data.showPrice == null) {
		data.showPrice = false;
	}

	catalog.data = data;

	return true;
}

async function showVehicle(model) {
	while (catalog.preview.entities.length) {
		DeleteEntity(catalog.preview.entities.pop());
	}

	const [loaded, err] = await loadModel(model);

	if (loaded == false) {
		console.log(`${err}, skipping...`);
		return;
	}

	if (catalog.preview.current != model) {
		console.log(`"${model}" is no longer active, unloading..`);
		SetModelAsNoLongerNeeded(model);
		return;
	}

	const handle = spawnVehicle(model, catalog.data.vehicle);

	if (catalog.preview.current != model) {
		console.log(`"${model}" is no longer active, deleting..`);
		DeleteEntity(handle);
		return;
	}

	catalog.preview.entities.push(handle);

	if (catalog.offset == null || catalog.data.updateOffset == true) {
		catalog.offset = true;
		let length = 0;

		if (catalog.data.offsetLength == true) {
			let dimensions = GetModelDimensions(model);
			length = (dimensions[1][1] - dimensions[0][1]) / 2;
		}

		AttachCamToEntity(catalog.camera, handle, catalog.data.offset.attach.x, length + catalog.data.offset.attach.y, catalog.data.offset.attach.z, true);
		PointCamAtEntity(catalog.camera, handle, catalog.data.offset.point.x, catalog.data.offset.point.y, catalog.data.offset.point.z, true);
	}
}

function onCatalogTick() {
	removeHud();
}

async function onInit(resourceName) {
	if (config.resourceName != resourceName) {
		return;
	}

	await delay(1000);

	let onServerInit;

	onServerInit = function(url) {
		const endpoint = url == "" ? getServerEndpoint() : url;
		
		SendNUIMessage({
			type: "Init",
			payload: { 
				endpoint: endpoint,
				labels: getStatLabels()
			}
		});

		removeEventListener(`${config.resourceName}:onInit`, onServerInit);
		emit(`${config.resourceName}:onInit`);			
	}

	onNet(`${config.resourceName}:onInit`, onServerInit);
	emitNet(`${config.resourceName}:onInit`);
}

function onOpen(data) {
	if (catalog.visible == true) {
		onClose();
	}

	const result = isCatalogDataValid(data);

	if (result != true) {
		console.log("%s, unable to open.", result);
		return;
	}

	catalog.visible = true;
	catalog.tick = setTick(onCatalogTick);
	catalog.camera = setupCamera();

	SetNuiFocus(true, true);
	SetFocusPosAndVel(catalog.data.vehicle.x, catalog.data.vehicle.y, catalog.data.vehicle.z, 0.0, 0.0, 0.0);

	SendNUIMessage({
		type: "Show",
		payload: {
			visible: true,
			showPrice: catalog.data.showPrice
		}
	});
}

function onClose(data, cb) {
	const ped = PlayerPedId();
	const pos = GetEntityCoords(ped);

	while (catalog.preview.entities.length) {
		DeleteEntity(catalog.preview.entities.pop());
	}

	removeCamera(cameraHandle);

	if (catalog.tick != null) {
		clearTick(catalog.tick);
		catalog.tick = null;
	}

	SetNuiFocus(false, false);
	SetFocusPosAndVel(pos[0], pos[1], pos[2], 0.0, 0.0, 0.0);

	catalog.offset = false;
	catalog.visible = false;

	if (cb != null) {
		cb("ok");
	}
}

function onIndexChanged(data, cb) {
	if (data.error != null) {
		cb("error");
		return;
	}

	catalog.preview.current = data.model;

	showVehicle(data.model);

	cb("ok");
}

RegisterNuiCallbackType("close");
RegisterNuiCallbackType("indexChanged");

on("onClientResourceStart", onInit);
on("__cfx_nui:close", onClose);
on("__cfx_nui:indexChanged", onIndexChanged);