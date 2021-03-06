import Navbar from "./navbar.js";
import Slider from "./slider.js";
import GamepadListener from "./gamepad.js";
import * as vehicleWidget from "./vehicleWidgets.js";

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
 * Initialise globals that require the game script initialised
 */
messages.init = function()
{
	// load stats labels
	vehicleWidget.stats.load();
}

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
		app.style.display = "none";
		// TODO: show loading screen?
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

	const slider = sliders[0];

	// show first slider
	slider.domElement.style.display = "flex";

	setActiveVehicle(catalog.vehicles[navbar.index][slider.index]);

	// hide sliders
	for (let i = 1; i < sliders.length; i++)
	{
		sliders[i].domElement.style.display = "none";
	}

	// start listening for Gamepad events
	gamepadListener.start();

	// make page visible
	app.style.display = "block";
	// TODO: hide loading screen?
}

/**
 * Close a catalog
 * @param {object} payload
 * @param {string} payload.id catalog id 
 * @param {bool} local is func being called locally (not from gamescript)
 */
messages.closeCatalog = function(payload, local)
{
	if (activeCatalog == null)
	{
		return;
	}

	if (activeCatalog != payload.id)
	{
		return;
	}

	// stop listening for Gamepad events
	gamepadListener.stop();

	// make page invisible
	app.style.display = "none";

	activeCatalog = null;

	if (!local)
	{
		return;
	}

	const resourceName = "GetParentResourceName" in window ? window.GetParentResourceName() : null;

	if (resourceName == null)
	{
		return;
	}

	// notify game script of catalog close
	fetch(`https://${resourceName}/close`, {
		method: "POST",
		body: JSON.stringify(payload.id)
	})
	.then(response => response.json())
	.then(data => { });
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

	// set index to 0
	next.change(-next.index);

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

	// prevent if loader is shown
	if (vehicleWidget.loader.style.display != "none")
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
			messages.closeCatalog({ id: activeCatalog }, true);
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
	// prevent if loader is shown
	if (vehicleWidget.loader.style.display != "none")
	{
		return;
	}

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
	// prevent if loader is shown
	if (vehicleWidget.loader.style.display != "none")
	{
		return;
	}

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
			messages.closeCatalog({ id: activeCatalog }, true);
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
	// prevent if loader is shown
	if (vehicleWidget.loader.style.display != "none")
	{
		return;
	}

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

	// update information widgets

	// set heading
	if (vehicleWidget.label != null)
	{
		const node = vehicleWidget.label.childNodes[0];

		if (node != null)
		{
			node.textContent = data.label ?? data.model;
		}
	}

	// set button text
	if (vehicleWidget.button != null)
	{
		if (data.price != null)
		{
			vehicleWidget.button.textContent = "Purchase";
		}
		else
		{
			vehicleWidget.button.textContent = "Select";
		}		
	}

	const resourceName = "GetParentResourceName" in window ? window.GetParentResourceName() : null;

	if (resourceName == null)
	{
		return;
	}

	// update game script with selected vehicle
	fetch(`https://${resourceName}/setActiveVehicle`, {
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
		vehicleWidget.stats.update(data);
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
	const widgetContainer = vehicleWidget.create();

	// close widget onclick
	vehicleWidget.close.onclick = function()
	{
		messages.closeCatalog({ id: activeCatalog }, true);
	}

	// select-btn widget onclick
	vehicleWidget.button.onclick = function()
	{
		// prevent if loader is shown
		if (vehicleWidget.loader.style.display != "none")
		{
			return;
		}

		// get current catalog, category & vehicle
		const catalog = activeCatalog;
		const category = navbar.index;
		const vehicle = sliders[category].index;

		// prevent going further
		if (catalog == null || category == null || vehicle == null)
		{
			return;
		}

		// get vehicle data
		const data = catalogs[catalog].vehicles[category][vehicle];

		// prevent going further
		if (data == null)
		{
			return;
		}

		// update loader label
		if (vehicleWidget.loaderLabel != null)
		{
			vehicleWidget.loaderLabel.textContent = data.price == null ? "Selecting" : "Purchasing";
		}

		// show loader
		vehicleWidget.loader.style.display = "block";

		const resourceName = "GetParentResourceName" in window ? window.GetParentResourceName() : null;

		if (resourceName == null)
		{
			vehicleWidget.loader.style.display = "none";

			return;
		}
	
		// notify game script of vehicle select
		fetch(`https://${resourceName}/select`, {
			method: "POST",
			body: JSON.stringify({
				catalog: catalog,
				category: category,
				vehicle: vehicle
			})
		})
		.then(response => response.json())
		.then(data => {
			if (data == true)
			{
				messages.closeCatalog({ id: activeCatalog }, true);
			}

			vehicleWidget.loader.style.display = "none";
		});
	}

	// append vehicle widgets to DOM
	app.appendChild(widgetContainer);

	// listen for events
	window.addEventListener("message", onMessage);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("wheel", onMouseWheel);
	window.addEventListener(GamepadListener.BUTTON_PRESSED_EVENT, onGamepadButtonPressed);
	window.addEventListener(GamepadListener.AXES_MOVE_EVENT, onGamepadAxesMove);
}

init();