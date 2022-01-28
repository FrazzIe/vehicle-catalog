import Navbar from "./navbar.js";
import Slider from "./slider.js";
import GamepadListener from "./gamepad.js";
import * as vehiclePanel from "./vehiclePanel.js";

const messages = {};
const catalogs = {};

let app;
let navbar;
let sliders;
let gamepadListener;
let activeCatalog;
let sliderFocused;

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

	// start listening for Gamepad events
	gamepadListener.start();

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
	// stop listening for Gamepad events
	gamepadListener.stop();

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

	if (next == null)
	{
		return;
	}

	// make visible
	next.domElement.style.display = "flex";	

	const catalog = catalogs[activeCatalog];

	if (catalog == null)
	{
		return;
	}

	setActiveVehicle(catalog.vehicles[event.detail.new][next.index]);	
}

/**
 * Listen for slider index updates
 * @param {Event} event 
 */
function onSliderIndexChanged(event)
{
	if (event.detail == null)
	{
		return;
	}

	if (event.detail.old == null || event.detail.new == null)
	{
		return;
	}

	const catalog = catalogs[activeCatalog];

	if (catalog == null)
	{
		return;
	}

	setActiveVehicle(catalog.vehicles[navbar.index][event.detail.new]);
}

/**
 * Listen for key press down
 * @param {Event} event 
 */
function onKeyDown(event)
{
	if (event.defaultPrevented)
	{
		return;
	}

	switch(event.key)
	{
		case "w":
		case "ArrowUp":
		{
			// Switch focus to slider
			sliderFocused = false;
			break;
		}
		case "s":
		case "ArrowDown":
		{
			// Switch focus to navbar
			sliderFocused = true;
			break;
		}
		case "a":
		case "ArrowLeft":
		{
			// decrement nav/slider
			if (sliderFocused)
			{
				sliders[navbar.index].change(-1);
			}
			else
			{
				navbar.change(-1);
			}

			break;
		}
		case "d":
		case "ArrowRight":
		{
			// increment nav/slider
			if (sliderFocused)
			{
				sliders[navbar.index].change(1);
			}
			else
			{
				navbar.change(1);
			}

			break;
		}
		case "Escape":
		case "Backspace":
		{
			// TODO: Close catalog
			break;
		} 
	}

	event.preventDefault();
}

/**
 * Listen for mouse wheel scroll
 * @param {Event} event 
 */
function onMouseWheel(event)
{
	if (event.deltaY == 0)
	{
		return;
	}

	let amount = 1;

	if (event.deltaY < 0)
	{
		amount = -1;
	}

	// increment/decrement nav/slider
	if (sliderFocused)
	{
		sliders[navbar.index].change(amount);
	}
	else
	{
		navbar.change(amount);
	}
}

/**
 * Listen for gamepad button press down
 * @param {Event} event 
 */
function onGamepadButtonPressed(event)
{
	switch(event.detail.button)
	{
		case 14: // D-PAD LEFT
		{
			// decrement slider
			sliders[navbar.index].change(-1);
			break;
		}
		case 15: // D-PAD RIGHT
		{
			// increment slider
			sliders[navbar.index].change(1);
			break;
		}
		case 4: // LEFT BUMPER
		{
			// decrement nav
			navbar.change(-1);
			break;
		}
		case 5: // RIGHT BUMPER
		{
			// increment nav
			navbar.change(1);
			break;
		}
		case 1:	// B or Circle
		case 8: // BACK BUTTON
		{
			// TODO: Close catalog
			break;
		} 
	}
}

/**
 * Listen for gamepad axes move
 * @param {Event} event 
 */
function onGamepadAxesMove(event)
{
	switch(event.detail.axes)
	{
		case 0: // LEFT STICK X-AXIS
		{
			// increment/decrement nav/slider
			const amount = event.detail.value > 0 ? 1 : -1;

			if (sliderFocused)
			{
				sliders[navbar.index].change(amount);
			}
			else
			{
				navbar.change(amount);
			}

			break;
		}
		case 3: // RIGHT STICK Y-AXIS
		{
			// Switch focus between nav and slider
			sliderFocused = event.detail.value > 0;
			break;
		}
	}
}

/**
 * Sets the active vehicle
 * 
 * Updates game script with selected vehicle
 * 
 * Updates UI Information panel for vehicle
 * 
 * @param {object} data slider item data
 * @param {string} data.model vehicle model
 * @param {string} [data.label] vehicle label
 * @param {number} [data.price] vehicle price
 */
function setActiveVehicle(data)
{
	if (data == null)
	{
		return;
	}

	if (data.model == null)
	{
		return;
	}

	// update information panel
	
	// set heading
	if (vehiclePanel.label != null)
	{
		vehiclePanel.label.textContent = data.label ?? data.model;
	}

	// set button text
	if (vehiclePanel.button != null)
	{
		if (data.price != null)
		{
			vehiclePanel.button.textContent = "Purchase";
		}
		else
		{
			vehiclePanel.button.textContent = "Select";
		}		
	}

	const resourceName = "GetParentResourceName" in window ? window.GetParentResourceName() : null;

	if (resourceName == null)
	{
		return;
	}

	// update game script with selected vehicle
	fetch(`https://${resourceName}/indexChanged`, {
		method: "POST",
		body: JSON.stringify(data.model)
	})
	.then(response => response.json())
	.then(data => {

		if (data == null || data.length == 0)
		{
			return;
		}

		// update stat bars
		vehiclePanel.stats.update(data);
	});
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

	gamepadListener = new GamepadListener();

	activeCatalog = null;
	sliderFocused = true;

	// event listener for NavbarIndexChanged
	navbar.domElement.addEventListener(Navbar.INDEX_CHANGED_EVENT, onNavbarIndexChanged);
	
	// append navbar to DOM
	const mainContainer = app.children[0];

	if (mainContainer == null)
	{
		throw "Main container is null";
	}
	
	mainContainer.appendChild(navbar.domElement);

	// create vehicle panel
	const panelElement = vehiclePanel.create();

	// append vehicle panel to DOM
	app.appendChild(panelElement);

	// listen for events
	window.addEventListener("message", onMessage);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("wheel", onMouseWheel);
	window.addEventListener(GamepadListener.BUTTON_PRESSED_EVENT, onGamepadButtonPressed);
	window.addEventListener(GamepadListener.AXES_MOVE_EVENT, onGamepadAxesMove);
}

init();