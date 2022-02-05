const catalogs = {};

/**
 * Registers a catalog
 * @param {string} id catalog id
 * @param {object} data catalog data
 * @param {string[]} data.categories list of catagories
 * @param {object[][]} data.vehicles list of vehicles
 */
function onRegisterCatalog(id, data)
{
	if (id == null || id == "")
	{
		throw `Unable to register catalog, malformed id: "${id}"`;
	}

	if (data == null)
	{
		throw `Unable to register catalog, data is null`;
	}

	if (data.categories == null || data.categories.length == 0)
	{
		throw "Unable to register catalog, data.categories is null or empty";
	}

	if (data.vehicles == null || data.vehicles.length == 0)
	{
		throw "Unable to register catalog, data.vehicles is null or empty";
	}

	// store catalog
	catalogs[id] = data;

	emitNet("vehicle-catalog:registerCatalog", -1, id, data);
}

/**
 * Listen for init event from client
 */
function onInit()
{
	const src = global.source;

	// send registered catalogs to client
	emitNet("vehicle-catalog:init", src, catalogs);
}

on("vehicle-catalog:registerCatalog", onRegisterCatalog);
onNet("vehicle-catalog:init", onInit);