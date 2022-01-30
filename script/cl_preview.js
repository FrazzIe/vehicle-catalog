const entities = [];

let curPreview;

/**
 * Create a local vehicle
 * @param {string} model vehicle model
 * @param {object} position vehicle coordinates
 * @param {number} position.x x
 * @param {number} position.y y
 * @param {number} position.z z
 * @param {number} position.heading heading
 * @returns {number} vehicle handle
 */
function createPreview(model, position)
{
	const handle = CreateVehicle(model, position.x, position.y, position.z, position.heading, false, false);
	
	SetVehicleOnGroundProperly(handle);
	FreezeEntityPosition(handle, true);
	SetEntityCollision(handle, false, true);
	SetModelAsNoLongerNeeded(model);

	return handle;
}

/**
 * Event listener for setActiveVehicle
 * @param {string} data vehicle model
 * @param {function} callback 
 */
function onSetActiveVehicle(data, callback)
{
	if (activeCatalog == null)
	{
		return;
	}

	activeCatalog.model = data;

	// delete previous vehicles
	while (entities.length > 0)
	{
		DeleteEntity(entities.pop());
	}

	// TODO: create vehicle
	curPreview = null;

	// add curPreview entity list
	entities.push(curPreview);
}

on("__cfx_nui:setActiveVehicle", onSetActiveVehicle);