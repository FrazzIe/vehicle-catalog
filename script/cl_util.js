function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

function setupCamera() {
	let handle = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);

	SetCamFov(handle, 45.0);
	SetCamActive(handle, true);
	RenderScriptCams(true, false, 0, 1, 0);

	return handle;
}

function removeCamera(handle) {
	SetCamActive(handle, false);
	RenderScriptCams(false, false, 0, 1, 0);
	DestroyCam(handle, false);
}

function removeHud() {
	for (let i = 1; i < 22; i++)
		HideHudComponentThisFrame(i);

	HideHudAndRadarThisFrame();
	RemoveMultiplayerHudCash();
	ThefeedHideThisFrame();
}

async function loadModel(model) {
	if (!IsModelInCdimage(model))
		return [false, `"${model}" model doesn't exist`];

	let gameTime = GetGameTimer();

	RequestModel(model);

	while (!HasModelLoaded(model) && GetGameTimer() - gameTime < 10000) {
		await delay(200);
	}

	return [HasModelLoaded(model), `"${model}" took too long to load`];
}

function spawnVehicle(model, pos) {
	let handle = CreateVehicle(model, pos.x, pos.y, pos.z, pos.w, false, false);
	SetVehicleOnGroundProperly(handle);
	FreezeEntityPosition(handle, true);
	SetEntityCollision(handle, false, true);
	SetModelAsNoLongerNeeded(model);

	return handle;
}

function getServerEndpoint() {
	let endpoint = GetCurrentServerEndpoint();

	//hacky fix for a locally hosted server with a local client
	let pattern = /(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/;
	let splitEndpoint = endpoint.split(':');
	if (pattern.test(splitEndpoint[0]))
		endpoint = `127.0.0.1:${splitEndpoint[1]}`;
	
	return endpoint;
}