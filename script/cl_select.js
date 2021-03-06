let selectCallback;

/**
 * Event listener for select vehicle
 * 
 * Starts vehicle selected transaction
 * 
 * @param {object} data
 * @param {string} data.catalog catalog id
 * @param {number} data.category category index
 * @param {number} data.vehicle vehicle index
 * @param {function} callback 
 */
function onSelectVehicle(data, callback)
{
	selectCallback = callback;

	emitNet("vehicle-catalog:selectStart", data);
}

/**
 * Event listener for finsing select vehicle
 * 
 * Ends vehicle selected transaction
 * 
 * If success close catalog
 * 
 * Else disable loading screen
 * @param {bool} success 
 */
function onSelectEnd(success)
{
	if (selectCallback != null)
	{
		selectCallback(success == true);

		selectCallback = null;
	}
}

RegisterNuiCallbackType("select");

on("__cfx_nui:select", onSelectVehicle);
onNet("vehicle-catalog:selectEnd", onSelectEnd);