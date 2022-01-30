const catalogs = {};

let activeCatalog;

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
	// store catalog
	catalogs[id] = true;

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

/**
 * Open a catalog
 * @param {object} options 
 * @param {number} options.id catalog id
 * @param {object} options.position vehicle position
 * @param {number} options.position.x x
 * @param {number} options.position.y y
 * @param {number} options.position.z z
 * @param {number} options.position.heading heading
 * @param {object} options.camera camera offsets
 * @param {object} options.camera.attach ATTACH_CAM_TO_ENTITY offset
 * @param {number} options.camera.attach.x x
 * @param {number} options.camera.attach.y y
 * @param {number} options.camera.attach.z z
 * @param {bool} options.camera.attach.length adds the length of the model to the offset
 * @param {bool} options.camera.attach.breadth adds the breadth of the model to the offset
 * @param {object} options.camera.point POINT_CAM_AT_ENTITY offset
 * @param {number} options.camera.point.x x
 * @param {number} options.camera.point.y y
 * @param {number} options.camera.point.z z
 */
function onOpenCatalog(options)
{
	// TODO
}

on("onClientResourceStart", onInit);
onNet("vehicle-catalog:registerCatalog", onRegisterCategory);