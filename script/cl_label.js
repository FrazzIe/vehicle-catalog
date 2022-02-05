/**
 * Get name of a vehicle
 * @param {string} model vehicle model
 * @returns {string} vehicle name
 */
function getVehicleName(model)
{
	if (model == null || model == "")
	{
		return null;
	}

	if (!IsModelInCdimage(model))
	{
		return null;
	}

	const label = GetDisplayNameFromVehicleModel(model);
	
	return GetLabelText(label);
}

/**
 * Resolve a list of stat labels
 * @param {string[]} data stat fields
 * @param {function} callback callback func
 */
function onResolveStatLabels(data, callback)
{
	if (data == null || data.length == 0)
	{
		callback("ok");

		return;
	}

	const fields = [];

	// resolve labels
	for (let i = 0; i < data.length; i++)
	{
		fields[i] = GetLabelText(data[i]);
	}

	callback(fields);
}

RegisterNuiCallbackType("resolveStatLabels");

on("__cfx_nui:resolveStatLabels", onResolveStatLabels);