const messages = {};

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
	// listen for events
	window.addEventListener("message", onMessage);
}

init();