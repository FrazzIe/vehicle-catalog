const useEvents = "ongamepadconnected" in window;
const buttonThreshold = 0.12;
const axesThreshold = 0.2;

let ticking = false;
let callbacks = {};
let gamepads = [];

function onGamepadConnected(event) {
	gamepads[event.gamepad.index] = event.gamepad;
}

function onGamepadDisconnected(event) {
	delete gamepads[event.gamepad.index];
}

function fetchGamepads() {
	let _gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

	for (let i = 0; i < _gamepads.length; i++) {
		if (_gamepads[i])
			gamepads[_gamepads[i].index] = _gamepads[i];
	}
}

function onTick() {
	if (!useEvents)
		fetchGamepads();

	for (let idx in gamepads) {
		let pad = gamepads[idx];

		if (pad.mapping != "standard")
			continue;

		if (callbacks.onGamepad)
			callbacks.onGamepad(pad);

		if (callbacks.onGamepadButtonPressed || callbacks.onGameButtonReleased) {
			for (let i = 0; i < pad.buttons.length; i++) {
				let value = pad.buttons[i].value || pad.buttons[i];

				if (value && value > buttonThreshold && callbacks.onGamepadButtonPressed)
					callbacks.onGamepadButtonPressed(i, value, pad.buttons[i]);
				else if (callbacks.onGameButtonReleased)
					callbacks.onGameButtonReleased(i, value, pad.buttons[i]);
			}
		}

		if (callbacks.onGamepadAxisActive) {
			for (let i = 0; i < pad.axes.length; i++) {
				if (pad.axes[i] > axesThreshold || pad.axes[i] < -axesThreshold)
					callbacks.onGamepadAxisActive(i, pad.axes[i]);
			}
		}
	}

	if (ticking)
		requestAnimationFrame(onTick);
}

function startGamepadListener(_callbacks) {
	if (ticking)
		return;

	if (typeof(_callbacks) === "object")
		callbacks = _callbacks;
	
	if (useEvents) {
		window.addEventListener("gamepadconnected", onGamepadConnected, false);
		window.addEventListener("gamepaddisconnected", onGamepadDisconnected, false);
	}

	ticking = true;

	requestAnimationFrame(onTick);
}

function stopGamepadListener() {
	ticking = false;

	if (useEvents) {
		window.removeEventListener("gamepadconnected", onGamepadConnected);
		window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
	}
}

export { startGamepadListener, stopGamepadListener };