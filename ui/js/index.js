import Navbar from "./navbar.js";
import Slider from "./slider.js";

const messages = {};
const catalogs = {};

let app;
let navbar;
let sliders;
let activeCatalog;

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
 * Open a catalog
 * @param {object} payload
 * @param {string} payload.id catalog id 
 */
messages.openCatalog = function(payload)
{
	if (payload.id == null)
	{
		return;
	}

	const catalog = catalogs[payload.id];

	if (catalog == null)
	{
		return;
	}

	if (payload.id == activeCatalog)
	{
		return;
	}

	if (activeCatalog != null)
	{
		// TODO: Hide catalog, show loading screen?
	}

	// set active catalog
	activeCatalog = payload.id;

	navbar.populate(catalog.categories);

	const numCategories = catalog.categories;
	const numSliders = sliders.length;

	if (numSliders > numCategories)
	{
		// populate existing sliders
		for (let i = 0; i < numCategories; i++)
		{
			sliders[i].populate(catalog.vehicles[i]);
		}

		// delete unused sliders
		for (let i = numCategories; i < numSliders; i++)
		{
			let slider = sliders[i];

			if (slider != null)
			{
				if (slider.domElement.parentElement != null)
				{
					slider.domElement.parentElement.removeChild(slider.domElement);
				}

				slider = null;
				delete sliders[i];
			}
		}
	}		
	else
	{
		// populate existing sliders
		for (let i = 0; i < numSliders; i++)
		{
			sliders[i].populate(catalog.vehicles[i]);
		}

		// create sliders
		for (let i = numSliders; i < numCategories; i++)
		{
			sliders[i] = new Slider(`catalog-slider-${i}`, catalog.vehicles[i]);
			
			// TODO: Append slider to DOM
		}
	}
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
	app = document.getElementById("app");

	if (app == null)
	{
		throw "App container is null";
	}

	navbar = new Navbar("catalog-navbar");

	sliders = [];
	activeCatalog = null;

	// append navbar to DOM
	const mainContainer = app.children[0];

	if (mainContainer == null)
	{
		throw "Main container is null";
	}
	
	mainContainer.appendChild(navbar.domElement);

	// listen for events
	window.addEventListener("message", onMessage);
}

init();