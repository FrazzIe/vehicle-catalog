function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

function setupCamera(data) {
	let handle = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);

	SetCamCoord(handle, data.pos.x, data.pos.y, data.pos.z);
	SetCamRot(handle, data.rot.x, data.rot.y, data.rot.z, 2);
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