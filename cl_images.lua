local coords = {
	vehicle = vector4(225.13684082031, -992.03826904297, -98.999984741211, 223.19395446777),
	camera = {
		pos = vector3(231.40397644043, -993.36932373047, -97.884582519531),
		rot = vector3(-12.725121498108, 0.0, 79.173896789551)
	}
}
local hideHud = false
local cameraHandle = nil
local lastPed = nil
local lastPedCoords = nil
local lastVehicle = nil

function RemoveHud()
	hideHud = true

	while hideHud do
		for i = 1, 22 do
			HideHudComponentThisFrame(i)
		end

		HideHudAndRadarThisFrame()
		RemoveMultiplayerHudCash()
		ThefeedHideThisFrame()

		SetWeather("EXTRASUNNY")
		NetworkOverrideClockTime(12, 0, 0)

		for i = 0, 2 do
			DisableAllControlActions(i)
		end

		Citizen.Wait(0);
	end
end

function SetWeather(weatherType)
    ClearWeatherTypePersist()
    SetWeatherTypeNowPersist(weatherType)
    SetWeatherTypeNow(weatherType)
    SetWeatherTypePersist(weatherType)
end

RegisterNUICallback("setupImage", function(data, cb)
	if lastVehicle ~= nil then
		SetEntityCoords(lastVehicle, -4000.0, -4000.0, -4000.0)
		SetEntityAsMissionEntity(lastVehicle, false, true)
		DeleteVehicle(lastVehicle)

		lastVehicle = nil
	end

	Citizen.Wait(500)

	local model = data.model
	
	RequestModel(model)

	while not HasModelLoaded(model) do
		Citizen.Wait(200)
	end

	lastVehicle = CreateVehicle(model, coords.vehicle.x, coords.vehicle.y, coords.vehicle.z, coords.vehicle.w, false, false)
	SetVehicleOnGroundProperly(lastVehicle)
	SetModelAsNoLongerNeeded(model)

	Citizen.Wait(500)

	cb("ok")
end)

RegisterNUICallback("endImage", function(data, cb)
	if lastPed ~= nil then
		SetEntityCoords(lastPed, lastPedCoords.x, lastPedCoords.y, lastPedCoords.z)
		ResetEntityAlpha(lastPed)
		FreezeEntityPosition(lastPed, false)
	end

	SetCamActive(cameraHandle, false)
	RenderScriptCams(false, false, 0, 1, 0)

	hideHud = false

	cb("ok")
end)

RegisterCommand("generate_vehicle_images", function(src, args, raw)
	Citizen.CreateThread(RemoveHud)
	
	lastPed = PlayerPedId()
	lastPedCoords = GetEntityCoords(lastPed)
	SetEntityCoords(lastPed, coords.camera.pos.x, coords.camera.pos.y, coords.camera.pos.z)
	FreezeEntityPosition(lastPed, true)
	SetEntityAlpha(lastPed, 0)

	cameraHandle = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
	SetCamCoord(cameraHandle, coords.camera.pos.x, coords.camera.pos.y, coords.camera.pos.z)
	SetCamRot(cameraHandle, coords.camera.rot.x, coords.camera.rot.y, coords.camera.rot.z, 2)
	SetCamFov(cameraHandle, 45.0)
	SetCamActive(cameraHandle, true)
	RenderScriptCams(true, false, 0, 1, 0)

	local interior = GetInteriorAtCoords(coords.camera.x, coords.camera.y, coords.camera.z)

	if interior ~= 0 then
		PinInteriorInMemory(interior)
		while not IsInteriorReady(interior) do
			Citizen.Wait(200)
		end
	end

	SendNUIMessage({ type = "GenerateVehicleImages", payload = {} })
end)
end)
