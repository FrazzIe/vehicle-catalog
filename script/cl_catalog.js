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