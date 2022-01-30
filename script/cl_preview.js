const entities = [];

/**
 * Event listener for setActiveVehicle
 * @param {string} data vehicle model
 * @param {function} callback 
 */
function onSetActiveVehicle(data, callback)
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