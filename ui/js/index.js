import Navbar from "./navbar.js";
import Slider from "./slider.js";

const messages = {};
const catalogs = {};

/*
	Functions to be called from game script
*/

/**
 * Register a catalog
 * @param {object} payload Message payload
 * @param {string} payload.id catalog id
 * @param {object} payload.data catalog data
 * @param {string[]} payload.data.categories list of catagories
 * @param {object[][]} payload.data.vehicles list of vehicles
 */
messages.registerCatalog = function(payload)
{
	if (payload.id == null)
	{
		return;
	}

	if (payload.data == null)
	{
		return;
	}

	if (payload.data.categories == null || payload.data.categories.length == 0)
	{
		return;
	}

	if (payload.data.vehicles == null || payload.data.vehicles.length == 0)
	{
		return;
	}

	// store catalog
	catalogs[payload.id] = payload.data;
}

/**
 * Listen for messages received from game script
 * @param {Event} event 
 */
function onMessage(event)
{
	const data = event.data || event.detail;

	if (messages[data.type] == null)
	{
		return;
	}

	messages[data.type](data.payload);
}

/**
 * Initilaise globals
 * 
 * Add event listeners
 */
function init()
{
	// listen for events
	window.addEventListener("message", onMessage);
}

init();