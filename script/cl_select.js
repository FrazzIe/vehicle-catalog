/**
 * 
 * @param {object} data
 * @param {string} data.id catalog id
 * @param {number} data.category category index
 * @param {number} data.vehicle vehicle index
 * @param {function} callback 
 */
function onSelectVehicle(data, callback)
{

}

RegisterNuiCallbackType("select");

on("__cfx_nui:select", onSelectVehicle);