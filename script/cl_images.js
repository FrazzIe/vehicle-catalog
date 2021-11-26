const coords = {
	vehicle: { x: 225.13684082031, y: -992.03826904297, z: -98.999984741211, w: 223.19395446777 },
	camera: {
		pos: { x: 231.40397644043, y: -993.36932373047, z: -97.884582519531 },
		rot: { x: -12.725121498108, y: 0.0, z: 79.173896789551 }
	}
};
let hudTick;
let cameraHandle;
let lastPed;
let lastPedCoords;
let lastVehicle;
let resourceName = GetCurrentResourceName();

function setWeather(weatherType) {
	ClearWeatherTypePersist();
	SetWeatherTypeNowPersist(weatherType);
	SetWeatherTypeNow(weatherType);
	SetWeatherTypePersist(weatherType);
}

function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

async function removeHud() {
	for (let i = 1; i < 22; i++)
		HideHudComponentThisFrame(i);

	HideHudAndRadarThisFrame();
	RemoveMultiplayerHudCash();
	ThefeedHideThisFrame();

	setWeather("EXTRASUNNY");
	NetworkOverrideClockTime(12, 0, 0);

	for (let i = 0; i < 2; i++)
		DisableAllControlActions(i);
}

async function onSetupImage(data, cb) {
	if (lastVehicle) {
		SetEntityCoords(lastVehicle, -4000.0, -4000.0, -4000.0);
		SetEntityAsMissionEntity(lastVehicle, false, true);
		DeleteVehicle(lastVehicle);

		lastVehicle = null;
	}

	await delay(500);

	let model = data.model;
	
	if (!IsModelInCdimage(model)) {
		console.log(`"${model}" model doesn't exist, skipping...`);
		cb("skip");
		return;
	}

	RequestModel(model);

	while (!HasModelLoaded(model)) {
		await delay(200);
	}

	lastVehicle = CreateVehicle(model, coords.vehicle.x, coords.vehicle.y, coords.vehicle.z, coords.vehicle.w, false, false);
	FreezeEntityPosition(lastVehicle, true);
	SetVehicleOnGroundProperly(lastVehicle);
	SetEntityCollision(lastVehicle, false, true);
	SetModelAsNoLongerNeeded(model);

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

	SetCamActive(cameraHandle, false);
	RenderScriptCams(false, false, 0, 1, 0);

	if (hudTick) {
		clearTick(hudTick);
		hudTick = null;
	}

	TriggerServerEvent(`${resourceName}:onGenerateEnd`);
	cb("ok");
}

async function onGenerateStart(format) {
	hudTick = setTick(removeHud);
	
	lastPed = PlayerPedId();
	lastPedCoords = GetEntityCoords(lastPed);
	SetEntityCoords(lastPed, coords.camera.pos.x, coords.camera.pos.y, coords.camera.pos.z);
	FreezeEntityPosition(lastPed, true);
	SetEntityAlpha(lastPed, 0);

	cameraHandle = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
	SetCamCoord(cameraHandle, coords.camera.pos.x, coords.camera.pos.y, coords.camera.pos.z);
	SetCamRot(cameraHandle, coords.camera.rot.x, coords.camera.rot.y, coords.camera.rot.z, 2);
	SetCamFov(cameraHandle, 45.0);
	SetCamActive(cameraHandle, true);
	RenderScriptCams(true, false, 0, 1, 0);

	let interior = GetInteriorAtCoords(coords.camera.pos.x, coords.camera.pos.y, coords.camera.pos.z);

	if (interior != 0) {
		PinInteriorInMemory(interior)
		while (!IsInteriorReady(interior)) {
			await delay(200);
		}
	}

	RemoveDecalsInRange(coords.camera.pos.x, coords.camera.pos.y, coords.camera.pos.z, 25.0);
	ClearAreaOfVehicles(coords.camera.pos.x, coords.camera.pos.y, coords.camera.pos.z, 25.0, false, false, false, false, false);

	SendNuiMessage(JSON.stringify({
		type: "GenerateVehicleImages", 
		payload: { endpoint: GetCurrentServerEndpoint(), id: GetPlayerServerId(PlayerId()), format: format }
	}));
}

RegisterNuiCallbackType("setupImage");
RegisterNuiCallbackType("endImage");

on("__cfx_nui:setupImage", onSetupImage);
on("__cfx_nui:endImage", onEndImage);
onNet(`${resourceName}:onGenerateStart`, onGenerateStart);