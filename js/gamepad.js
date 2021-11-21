const useEvents = "ongamepadconnected" in window;

let ticking = false;
let callback = function() { };
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

	callback(gamepads);
	if (ticking)
		requestAnimationFrame(onTick);
}

function startGamepadListener(_callback) {
	if (ticking)
		return;

	if (typeof(_callback) === "function")
		callback = _callback;
	
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