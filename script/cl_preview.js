const entities = [];

let curPreview;

/**
 * Event listener for setActiveVehicle
 * @param {string} data vehicle model
 * @param {function} callback 
 */
function onSetActiveVehicle(data, callback)
{
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