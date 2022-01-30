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

	// add created vehicle to entity list
	entities.push(handle);
}

on("__cfx_nui:setActiveVehicle", onSetActiveVehicle);