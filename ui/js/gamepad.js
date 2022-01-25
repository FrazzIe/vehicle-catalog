const useEvents = "ongamepadconnected" in window;
const buttonThreshold = 0.12;
const axesThreshold = 0.2;

let active = false;
let gamepads = [];

/**
 * Listen for gamepadconnected events
 * @param {Event} event 
 */
function onGamepadConnected(event)
{
	if (event.gamepad == null)
	{
		return;
	}

	if (event.gamepad.index == null)
	{
		return;
	}

	// store gamepad
	gamepads[event.gamepad.index] = event.gamepad;
}

/**
 * Listen for gamepaddisconnected events
 * @param {Event} event 
 */
function onGamepadDisconnected(event)
{
	// delete gamepad
	delete gamepads[event.gamepad.index];
}

/**
 * Fetch a list of active gamepads from navigator
 * 
 * For browsers that don't support gamepad DOM events
 */
function fetchGamepads() 
{
	let tempGamepads;

	// reset gamepads global
	gamepads = {};

	// null check
	if (window.navigator.getGamepads == null && window.navigator.webkitGetGamepads == null)
	{
		return;
	}

	// get gamepads list
	if (window.navigator.getGamepads != null)
	{
		tempGamepads = window.navigator.getGamepads();
	}
	else
	{
		tempGamepads = window.navigator.webkitGetGamepads();
	}

	// store gamepads
	for (let i = 0; i < tempGamepads.length; i++)
	{
		const gamepad = tempGamepads[i];

		if (gamepad != null && gamepad.index != null)
		{
			gamepads[gamepad.index] = gamepad;
		}
	}
}

/**
 * Tick handler for animation frame
 * 
 * Queries each gamepad for button presses, dispatches events
 */
function onTick()
{
	// use navigator fallback if gamepad events aren't supported
	if (!useEvents)
	{
		fetchGamepads();
	}

	// loop through gamepads list
	// query each gamepad
	for (let i in gamepads)
	{
		const pad = gamepads[i];

		// skip gamepads that have a "weird" configuration
		if (pad.mapping != "standard")
		{
			continue;
		}

		// check buttons
		for (let i = 0; i < pad.buttons.length; i++)
		{
			const value = pad.buttons[i].value ?? pad.buttons[i];

			if (value == null)
			{
				continue;
			}

			if (value > buttonThreshold)
			{
				// press
			}
			else
			{
				// release
			}
		}

		// check thumbsticks
		for (let i = 0; i < pad.axes.length; i++)
		{
			const value = pad.axes[i];

			if (value == null)
			{
				continue;
			}

			if (value > axesThreshold || value < -axesThreshold)
			{
				// active
			}
		}		
	}

	if (active)
	{
		requestAnimationFrame(onTick);
	}
}

/**
 * Start gamepad tick handler
 */
function startGamepadListener()
{
	if (active)
	{
		return;
	}

	if (useEvents)
	{
		window.addEventListener("gamepadconnected", onGamepadConnected, false);
		window.addEventListener("gamepaddisconnected", onGamepadDisconnected, false);
	}

	active = true;

	requestAnimationFrame(onTick);
}

/**
 * Stop gamepad tick handler
 */
function stopGamepadListener()
{
	active = false;

	if (useEvents)
	{
		window.removeEventListener("gamepadconnected", onGamepadConnected);
		window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
	}
}

export { startGamepadListener, stopGamepadListener };