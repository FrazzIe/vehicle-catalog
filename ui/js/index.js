/**
 * Listen for messages received from game script
 * @param {Event} event 
 */
function onMessage(event)
{
	const data = event.data || event.detail;
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