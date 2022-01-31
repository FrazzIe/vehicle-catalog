const catalogs = {};

let activeCatalog;

/**
 * Listen for init event
 */
async function onInit()
{
	await delay(1000);

	// init web ui
	SendNUIMessage({ type: "init" });

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
		onRegisterCategory(id, catalogs[id]);
	}

	removeEventListener("vehicle-catalog:init", onInitResponse);
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
		type: "registerCatalog",
		payload: {
			id: id,
			data: data
		}
	});
}

/**
 * Open a catalog
 * @param {object} options 
 * @param {string} options.id catalog id
 * @param {object} options.position vehicle position
 * @param {number} options.position.x x
 * @param {number} options.position.y y
 * @param {number} options.position.z z
 * @param {number} [options.position.heading] heading
 * @param {object} options.camera camera offsets
 * @param {object} options.camera.attach ATTACH_CAM_TO_ENTITY offset
 * @param {number} options.camera.attach.x x
 * @param {number} options.camera.attach.y y
 * @param {number} options.camera.attach.z z
 * @param {bool} [options.camera.attach.length] adds the length of the model to the offset
 * @param {bool} [options.camera.attach.breadth] adds the breadth of the model to the offset
 * @param {object} options.camera.point POINT_CAM_AT_ENTITY offset
 * @param {number} options.camera.point.x x
 * @param {number} options.camera.point.y y
 * @param {number} options.camera.point.z z
 * @param {bool} options.camera.update use ATTACH_CAM_TO_ENTITY & POINT_CAM_AT_ENTITY on each vehicle
 */
function onOpenCatalog(options)
{
	// prevent execution on invalid options structure
	if (options == null)
	{
		return;
	}

	if (options.id == null || options.id == "" || options.position == null || options.camera == null)
	{
		return;
	}

	// ensure catalog exists
	if (!catalogs[options.id])
	{
		return;
	}

	if (isNaN(options.position.x) || isNaN(options.position.y) || isNaN(options.position.z))
	{
		return;
	}

	if (options.camera.attach == null || options.camera.point == null)
	{
		return;
	}

	if (isNaN(options.camera.attach.x) || isNaN(options.camera.attach.y) || isNaN(options.camera.attach.z) || isNaN(options.camera.point.x) || isNaN(options.camera.point.y) || isNaN(options.camera.point.z))
	{
		return;
	}

	// default values for optional options
	if (isNaN(options.position.heading))
	{
		options.position.heading = 0;
	}

	options.camera.attach.length = options.camera.attach.length == true;
	options.camera.attach.breadth = options.camera.attach.breadth == true;
	options.camera.update = options.camera.update == true;

	// set active catalog
	activeCatalog = options;

	// set camera focus
	SetFocusPosAndVel(options.position.x, options.position.y, options.position.z, 0.0, 0.0, 0.0);

	// setup camera
	activeCatalog.camera.handle = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);

	SetCamActive(activeCatalog.camera.handle, true);
	RenderScriptCams(true, false, 0, true, false);

	// take focus
	SetNuiFocus(true, true);

	// open catalog
	SendNUIMessage({
		type: "openCatalog",
		payload: {
			id: options.id
		}
	});
}

/**
 * Close catalog
 * @param {string} id catalog id 
 */
function onCloseCatalog(id, callback)
{
	if (activeCatalog == null)
	{
		if (callback != null)
		{
			callback("ok");
		}

		return;
	}

	// delete previous vehicles
	while (entities.length > 0)
	{
		DeleteEntity(entities.pop());
	}

	// clear camera focus
	ClearFocus();

	// reset camera
	SetCamActive(activeCatalog.camera.handle, false);
	RenderScriptCams(false, false, 0, true, false);
	DestroyCam(activeCatalog.camera.handle, false);

	// release focus
	SetNuiFocus(false, false);

	activeCatalog = null;

	if (callback != null)
	{
		callback("ok");
	}
	else
	{
		SendNUIMessage({
			type: "closeCatalog",
			payload: {
				id: id
			}
		});
	}
}

RegisterNuiCallbackType("close");

on("onClientResourceStart", onInit);
onNet("vehicle-catalog:registerCatalog", onRegisterCategory);
onNet("vehicle-catalog:openCatalog", onOpenCatalog);
onNet("vehicle-catalog:closeCatalog", onCloseCatalog);
on("__cfx_nui:close", onCloseCatalog);