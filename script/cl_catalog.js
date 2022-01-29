/**
 * Listen for init event
 */
function onInit()
{

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