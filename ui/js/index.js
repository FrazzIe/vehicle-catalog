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

	// get DOM container for sliders
	const mainContainer = app.children[0];

	if (mainContainer == null)
	{
		throw "Main container is null";
	}

	// set active catalog
	activeCatalog = payload.id;

	navbar.populate(catalog.categories);

	const numCategories = catalog.categories.length;
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
			const slider = new Slider(`catalog-slider-${i}`, catalog.vehicles[i]);
			
			// event listener for SliderIndexChanged
			slider.domElement.addEventListener(Slider.INDEX_CHANGED_EVENT, onSliderIndexChanged);

			// add slider to DOM
			mainContainer.appendChild(slider.domElement);

			// store slider
			sliders[i] = slider;
		}
	}

	// show first slider
	sliders[0].domElement.style.display = "flex";

	// hide sliders
	for (let i = 1; i < sliders.length; i++)
	{
		sliders[i].domElement.style.display = "none";
	}

	// make page visible
	app.style.display = "block";

	// TODO: Set selected vehicle stats, name etc in info-container
	// TODO: hide loading screen?
}

/**
 * Close a catalog
 * @param {object} payload
 * @param {string} payload.id catalog id 
 */
messages.closeCatalog = function(payload)
{
	// make page invisible
	app.style.display = "none";
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
 * Listen for navbar index updates
 * @param {Event} event 
 */
function onNavbarIndexChanged(event)
{
	if (event.detail == null)
	{
		return;
	}

	if (event.detail.old == null || event.detail.new == null)
	{
		return;
	}

	const last = sliders[event.detail.old];
	const next = sliders[event.detail.new];
	
	if (last != null)
	{
		last.domElement.style.display = "none";
	}

	if (next != null)
	{
		next.domElement.style.display = "flex";
	}

	// TODO: Vehicle selected callback
}

/**
 * Listen for slider index updates
 * @param {Event} event 
 */
function onSliderIndexChanged(event)
{
	// TODO: Vehicle selected callback
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

	// event listener for NavbarIndexChanged
	navbar.domElement.addEventListener(Navbar.INDEX_CHANGED_EVENT, onNavbarIndexChanged);
	
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