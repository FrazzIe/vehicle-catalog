/**
 * Event listener for select vehicle start
 * 
 * Starts vehicle selected transaction
 * 
 * @param {object} data
 * @param {string} data.catalog catalog id
 * @param {number} data.category category index
 * @param {number} data.vehicle vehicle index
 */
function onSelectStart(data)
{
	const src = global.source;
	const catalog = catalogs[data.catalog];

	// get vehicle details
	// cancel on invalid data
	if (catalog == null)
	{
		emitNet("vehicle-catalog:selectEnd", src, false);

		return;
	}

	const category = catalog.vehicles[data.category];

	if (category == null)
	{
		emitNet("vehicle-catalog:selectEnd", src, false);

		return;
	}

	const vehicle = category[data.vehicle];

	if (vehicle == null)
	{
		emitNet("vehicle-catalog:selectEnd", src, false);

		return;
	}

	// send vehicle details with callback handler
	emit("vehicle-catalog:selectVehicle", src, data.catalog, vehicle.model, vehicle.price, function(success)
	{
		emitNet("vehicle-catalog:selectEnd", src, success);
	});
}

onNet("vehicle-catalog:selectStart", onSelectStart);