function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

function setupCamera(data) {
	let handle = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);

	SetCamCoord(cameraHandle, data.pos.x, data.pos.y, data.pos.z);
	SetCamRot(cameraHandle, data.rot.x, data.rot.y, data.rot.z, 2);
	SetCamFov(cameraHandle, 45.0);
	SetCamActive(cameraHandle, true);
	RenderScriptCams(true, false, 0, 1, 0);

	return handle;
}

function removeCamera(handle) {
	SetCamActive(handle, false);
	RenderScriptCams(false, false, 0, 1, 0);
	DestroyCam(handle, false);
}