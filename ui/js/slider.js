/**
 * Event Listener for slider item clicks
 * @param {Event} event event object
 */
function onClick(event)
{

}

/**
 * Add item to slider
 */
function add()
{

}

/**
 * Add items to slider
 * @param {string} id slider element id
 * @param {object[]} values collection of slider items
 * @param {bool} [empty] empty previous slider items
 */
function populate(id, values, empty = true) 
{

}

/**
 * Create a slider
 * @param {string} id slider element id
 * @param {HTMLElement} parent parent element to append slider
 * @param {object[]} [values] collection of slider items
 */
function create(id, parent, values)
{
	if (id == null)
	{
		throw "slider element id is null";
	}

	if (parent == null)
	{
		throw "slider parent element is null";
	}

	if ((parent instanceof HTMLElement) == false)
	{
		throw "slider parent is not a HTMLElement";
	}

	const exists = document.getElementById(id);

	if (exists != null)
	{
		throw `slider element with id "${id}" already exists`;
	}

	const slider = document.createElement("div");
}

/**
 * Add/Subtract selected item index
 * @param {string} id slider element id
 * @param {number} amount amount to increment
 */
function increment(id, amount)
{

}