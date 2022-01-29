/**
 * Listen for init event
 */
function onInit()
{
	// TODO: add an await

	// init web ui
	SendNUIMessage({ type = "init" });

	// register temporary init event
	onNet("vehicle-catalog:init", onInitResponse);

	// init, sync client to server
	emitNet("vehicle-catalog:init");
}

/**
 * Listen for init response from server
 * 
 * Synchronises registered catalogs with server
 * 
 * @param {object[]} catalogs collection of catalog objects
 */
function onInitResponse(catalogs)
{
	// register each catalog
	for (const id in catalogs)
	{
		onRegisterCategory(id, catalogs[data]);
	}

	removeEventListener("vehicle-catalog:init", this);
}

/**
 * Registers a catalog
 * @param {string} id catalog id
 * @param {object} data catalog data
 * @param {string[]} data.categories list of catagories
 * @param {object[][]} data.vehicles list of vehicles
 */
function onRegisterCategory(id, data)
{
	// get resolved vehicle label for each vehicle
	for (let i = 0; i < data.vehicles.length; i++)
	{
		for (let j = 0; j < data.vehicles[i]; j++)
		{
			const vehicle = data.vehicles[i][j];

			if (vehicle != null)
			{
				vehicle.label = getVehicleName(vehicle.model);
			}
		}
	}

	// send catalog to web ui
	SendNUIMessage({
		type = "registerCatalog",
		payload = {
			id: id,
			data: data
		}
	});
}

on("onClientResourceStart", onInit);
onNet("vehicle-catalog:registerCatalog", onRegisterCategory);