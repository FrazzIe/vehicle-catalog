const INTERNAL_EVENTS_ENABLED = "ongamepadconnected" in window;
const INTERNAL_CONNECTED_EVENT = "gamepadconnected";
const INTERNAL_DISCONNECTED_EVENT = "gamepaddisconnected";

const DEFAULT_BUTTON_THRESHOLD = 0.12;
const DEFAULT_AXES_THRESHOLD = 0.2;

const DEFAULT_BUTTON_INTERVAL = 140;
const DEFAULT_AXES_INTERVAL = 160;

/**
 * Listens for gamepads collection, emits button and thumbstick events
 */
class GamepadListener
{
	static BUTTON_PRESSED_EVENT = "gamepadbuttonpressed";
	static BUTTON_JUST_PRESSED_EVENT = "gamepadbuttonjustpressed";
	static BUTTON_JUST_RELEASED_EVENT = "gamepadbuttonjustreleased";

	static AXES_MOVE_EVENT = "gamepadaxesmove";
	static AXES_START_MOVE_EVENT = "gamepadaxesstartmove";
	static AXES_STOP_MOVE_EVENT = "gamepadaxesstopmove";

	static #instance;
	#gamepads;
	#intervals;
	#states;
	#buttonThreshold;
	#axesThreshold;
	#buttonInterval;
	#axesInterval;
	#active;

	constructor()
	{
		// implement singleton
		if (GamepadListener.instance != null)
		{
			return GamepadListener.instance;
		}

		GamepadListener.#instance = this;

		// assign vars
		this.#gamepads = {};
		this.#intervals = {};
		this.#states = {};

		this.#buttonThreshold = DEFAULT_BUTTON_THRESHOLD;
		this.#axesThreshold = DEFAULT_AXES_THRESHOLD;

		this.#buttonInterval = DEFAULT_BUTTON_INTERVAL;
		this.#axesInterval = DEFAULT_AXES_INTERVAL;

		this.#active = false;
	}

	static get instance()
	{
		return this.#instance;
	}

	get active()
	{
		return this.#active;
	}

	set buttonThreshold(value)
	{
		if (isNaN(value))
		{
			throw "threshold is not a number";
		}

		if (value < 0.0 || value > 1.0)
		{
			throw "threshold must be between 0.0 and 1.0";
		}

		this.#buttonThreshold = value;
	}

	set axesThreshold(value)
	{
		if (isNaN(value))
		{
			throw "threshold is not a number";
		}

		if (value < 0.0 || value > 1.0)
		{
			throw "threshold must be between 0.0 and 1.0";
		}

		this.#buttonThreshold = value;
	}

	set buttonInterval(value)
	{
		if (isNaN(value))
		{
			throw "interval is not a number";
		}

		if (value < 0)
		{
			throw "interval must be between 0 and X";
		}

		this.#buttonInterval = value;
	}

	set axesInterval(value)
	{
		if (isNaN(value))
		{
			throw "interval is not a number";
		}

		if (value < 0)
		{
			throw "interval must be between 0 and X";
		}

		this.#axesInterval = value;
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
	 * Dispatch custom event on window object
	 * @param {string} eventName 
	 * @param {object} eventData 
	 * @returns 
	 */
	#dispatch(eventName, eventData)
	{
		if (eventData == null || eventData == null)
		{
			return;
		}

		const eventNameLocal = `on${eventName}`;
		const event = new CustomEvent(eventData, {
			detail: eventData
		});

		if (window[eventNameLocal] != null)
		{
			window[eventNameLocal](event);
		}

		window.dispatchEvent(event);
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
		for (let idx in this.gamepads)
		{
			const pad = this.gamepads[idx];

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

				const id = `${pad.index}-b-${i}`;
				const pressed = this.#states[id];

				if (value > this.#buttonThreshold)
				{
					if (pressed == null)
					{
						this.#states[id] = true;
						
						// fire just pressed
						this.#dispatch(GamepadListener.BUTTON_JUST_PRESSED_EVENT, { button: i, value: value, pad: pad });
					}

					const now = performance.now();
					const interval = this.#intervals[id];

					// check for active interval
					// skip event fire
					if (interval != null && now - interval <= this.#buttonInterval)
					{
						continue;
					}

					// set interval
					this.#intervals[id] = now;

					// fire press
					this.#dispatch(GamepadListener.BUTTON_PRESSED_EVENT, { button: i, value: value, pad: pad });
				}
				else if (pressed)
				{
					// remove interval
					delete this.#intervals[id];
					
					// release
					delete this.#states[id];

					// fire release
					this.#dispatch(GamepadListener.BUTTON_JUST_RELEASED_EVENT, { button: i, value: value, pad: pad });
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

				const id = `${pad.index}-a-${i}`;
				const moved = this.#states[id];

				if (value > this.#axesThreshold || value < -this.#axesThreshold)
				{
					if (moved == null)
					{
						this.#states[id] = true;

						// fire start move
						this.#dispatch(GamepadListener.AXES_START_MOVE_EVENT, { axes: i, value: value, pad: pad });
					}

					const now = performance.now();
					const interval = this.#intervals[id];

					// check for active interval
					// skip event fire
					if (interval != null && now - interval <= this.#axesInterval)
					{
						continue;
					}

					// set interval
					this.#intervals[id] = now;

					// fire move
					this.#dispatch(GamepadListener.AXES_MOVE_EVENT, { axes: i, value: value, pad: pad });
				}
				else if (moved)
				{
					// remove interval
					delete this.#intervals[id];
					
					// stop
					delete this.#states[id];

					// fire stop move
					this.#dispatch(GamepadListener.AXES_STOP_MOVE_EVENT, { axes: i, value: value, pad: pad });
				}
			}		
		}

		if (this.active)
		{
			requestAnimationFrame(this.#tickHandler.bind(this));
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
	
		this.#active = true;
	
		requestAnimationFrame(this.#tickHandler.bind(this));
	}

	/**
	 * Stop listening for Gamepad events
	 */
	stop()
	{
		this.#active = false;

		if (INTERNAL_EVENTS_ENABLED)
		{
			window.removeEventListener(INTERNAL_CONNECTED_EVENT, this.#connected);
			window.removeEventListener(INTERNAL_DISCONNECTED_EVENT, this.#disconnected);
		}
	}
}

export default GamepadListener;