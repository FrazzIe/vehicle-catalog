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
	if (values == null || values.length == 0)
	{
		return;
	}
	
	if (id == null)
	{
		throw "slider element id is null";
	}

	const slider = document.getElementById(id);

	if (slider == null)
	{
		throw `slider element with id "${id}" doesn't exist`;
	}
}

/**
 * Create a slider arrow
 * @param {HTMLDivElement} slider slider element
 * @param {bool} left arrow direction
 */
function createArrow(slider, left)
{
	if (slider == null)
	{
		throw `slider element is null`;
	}

	let direction;
	let incrementAmount;

	if (left == true)
	{
		direction = "left";
		incrementAmount = -1;
	}
	else
	{
		direction = "right";
		incrementAmount = 1;
	}

	// create arrow container
	const container = document.createElement("div");

	container.id = `${slider.id}-arrow-${direction}`;
	container.classList.add("arrow-container");

	// create arrow
	// append to container
	const arrow = document.createElement("div");

	arrow.classList.add("arrow", direction);
	
	container.appendChild(arrow);

	// container onclick
	container.onclick = function()
	{
		increment(slider.id, incrementAmount);
	}

	// append to slider
	slider.appendChild(container);
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

	slider.id = id;
	slider.classList.add("slider");

	// left arrow
	createArrow(slider, true);

	// items container
	const items = document.createElement("div");

	items.id = `${slider.id}-items`;
	items.classList.add("item-container");

	slider.appendChild(items);

	// right arrow
	createArrow(slider, false);

	parent.appendChild(slider);

	populate(id, values);
}

/**
 * Add/Subtract selected item index
 * @param {string} id slider element id
 * @param {number} amount amount to increment
 */
function increment(id, amount)
{

}