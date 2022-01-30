const entities = [];

/**
 * Event listener for setActiveVehicle
 * @param {string} data vehicle model
 * @param {function} callback 
 */
async function onSetActiveVehicle(data, callback)
{
	const model = data;

	if (activeCatalog == null)
	{
		return;
	}

	activeCatalog.model = model;

	// delete previous vehicles
	while (entities.length > 0)
	{
		DeleteEntity(entities.pop());
	}
	
	// check if model is valid
	if (!IsModelInCdimage(model))
	{
		return;
	}

	// request model
	RequestModel(model);

	// wait for model to load
	while (!HasModelLoaded(model))
	{
		await delay(50);
	}
	
	// cancel if model has changed between loading
	if (activeCatalog.model != model)
	{
		SetModelAsNoLongerNeeded(model);

		return;
	}

	// cancel on invalid position
	if (activeCatalog.position == null)
	{
		return;
	}

	// create vehicle
	const handle = CreateVehicle(model, activeCatalog.position.x, activeCatalog.position.y, activeCatalog.position.z, activeCatalog.position.heading, false, false);

	SetVehicleOnGroundProperly(handle);
	FreezeEntityPosition(handle, true);
	SetEntityCollision(handle, false, true);
	SetModelAsNoLongerNeeded(model);

	// cancel if model has changed after creation
	if (activeCatalog.model != model)
	{
		DeleteEntity(handle);

		return;
	}

	// add created vehicle to entity list
	entities.push(handle);

	// attach & point camera at entity
	if (activeCatalog.camera.offset == null || activeCatalog.camera.update)
	{
		let length = 0;
		let breadth = 0;

		if (activeCatalog.camera.attach.length || activeCatalog.camera.attach.breadth)
		{
			const dimensions = GetModelDimensions(model);

			if (activeCatalog.camera.attach.length)
			{
				length = (dimensions[1][1] - dimensions[0][1]) / 2;
			}

			if (activeCatalog.camera.attach.breadth)
			{
				breadth = (dimensions[1][0] - dimensions[0][0]) / 2;
			}
		}

		AttachCamToEntity(activeCatalog.camera.handle, handle, breadth + activeCatalog.camera.attach.x, length + activeCatalog.camera.attach.y, activeCatalog.camera.attach.z, true);
		PointCamAtEntity(activeCatalog.camera.handle, handle, activeCatalog.camera.point.x, activeCatalog.camera.point.y, activeCatalog.camera.point.z, true);
	}

	// send vehicle stats to web ui
	const [success, stats] = getVehicleStats(vehicleClassStats, handle);

	if (success)
	{
		callback(stats);
	}
}

RegisterNuiCallbackType("setActiveVehicle");

on("__cfx_nui:setActiveVehicle", onSetActiveVehicle);