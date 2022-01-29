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