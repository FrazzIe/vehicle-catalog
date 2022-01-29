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
		const catalog = catalogs[id];

		if (catalog == null)
		{
			continue;
		}

		// get resolved vehicle label for each vehicle
		for (let i = 0; i < catalog.vehicles.length; i++)
		{
			for (let j = 0; j < catalog.vehicles[i]; j++)
			{
				const vehicle = catalog.vehicles[i][j];

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
				data: catalogs[id]
			}
		});
	}

	removeEventListener("vehicle-catalog:init", this);
}

on("onClientResourceStart", onInit);