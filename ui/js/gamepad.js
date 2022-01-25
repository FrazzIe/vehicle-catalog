const INTERNAL_EVENTS_ENABLED = "ongamepadconnected" in window;
const INTERNAL_CONNECTED_EVENT = "gamepadconnected";
const INTERNAL_DISCONNECTED_EVENT = "gamepaddisconnected";

const DEFAULT_BUTTON_THRESHOLD = 0.12;
const DEFAULT_AXES_THRESHOLD = 0.2;

class GamepadListener
{
	constructor()
	{
		this.#gamepads = {};

		this.#buttonThreshold = DEFAULT_BUTTON_THRESHOLD;
		this.#axesThreshold = DEFAULT_AXES_THRESHOLD;

		this.active = false;
	}

	set buttonThreshold(threshold)
	{
		if (isNaN(threshold))
		{
			throw "threshold is not a number";
		}

		if (threshold < 0.0 || threshold > 1.0)
		{
			throw "threshold must be between 0.0 and 1.0";
		}

		this.#buttonThreshold = threshold;
	}

	set axesThreshold(threshold)
	{
		if (isNaN(threshold))
		{
			throw "threshold is not a number";
		}

		if (threshold < 0.0 || threshold > 1.0)
		{
			throw "threshold must be between 0.0 and 1.0";
		}

		this.#buttonThreshold = threshold;
	}

	/**
	 * Listen for gamepadconnected events
	 * @param {Event} event 
	 */
	#connected(event)
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
	#disconnected(event)
	{
		// delete gamepad
		delete gamepads[event.gamepad.index];
	}

	/**
	 * Fetch a list of active gamepads from navigator
	 * 
	 * For browsers that don't support gamepad DOM events
	 */
	#fetch() 
	{
		let tempGamepads;

		// reset gamepads global
		this.gamepads = {};

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
				this.gamepads[gamepad.index] = gamepad;
			}
		}
	}

	/**
	 * Tick handler for animation frame
	 * 
	 * Queries each gamepad for button presses, dispatches events
	 */
	#tickHandler()
	{
		// use navigator fallback if gamepad events aren't supported
		if (!INTERNAL_EVENTS_ENABLED)
		{
			this.#fetch();
		}

		// loop through gamepads list
		// query each gamepad
		for (let i in this.gamepads)
		{
			const pad = this.gamepads[i];

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

		if (this.active)
		{
			requestAnimationFrame(this.#tickHandler);
		}
	}

	/**
	 * Start listening for Gamepad events
	 */
	start()
	{
		if (this.active)
		{
			return;
		}
	
		if (INTERNAL_EVENTS_ENABLED)
		{
			window.addEventListener(INTERNAL_CONNECTED_EVENT, this.#connected);
			window.addEventListener(INTERNAL_DISCONNECTED_EVENT, this.#disconnected);
		}
	
		this.active = true;
	
		requestAnimationFrame(this.#tickHandler);
	}

	/**
	 * Stop listening for Gamepad events
	 */
	stop()
	{
		this.active = false;

		if (INTERNAL_EVENTS_ENABLED)
		{
			window.removeEventListener(INTERNAL_CONNECTED_EVENT, this.#connected);
			window.removeEventListener(INTERNAL_DISCONNECTED_EVENT, this.#disconnected);
		}
	}
}

export default new GamepadListener();