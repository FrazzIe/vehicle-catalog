/**
 * Event Listener for slider item clicks
 * @param {Event} event event object
 */
function onClick(event)
{

}

/**
 * Add item to slider
 * @param {HTMLDivElement} slider slider element
 * @param {object} data slider item data
 * @param {string} data.model vehicle model
 * @param {number} [data.price] vehicle price
 * @param {number} idx slider item index
 */
function add(slider, data, idx)
{
	if (slider == null)
	{
		throw `slider element is null`;
	}

	const items = slider.children[1];

	if (items == null)
	{
		throw `slider element with id "${id}" doesn't have items container`;
	}

	if (idx == null)
	{
		throw "slider item index is null";
	}

	// create item
	const item = document.createElement("div");

	item.classList.add("item");
	item.id = `${items.id}-${idx}`;

	item.onclick = onClick;

	// create image for item
	const image = document.createElement("img");

	// load default image on error
	image.onerror = function()
	{
		image.onerror = null;
		image.src = "";
	};

	// prevent image drag
	image.ondragstart = function()
	{
		return false;
	};

	image.src = "";

	item.appendChild(image);

	// create text label for item
	const textLabel = document.createElement("div");

	textLabel.classList.add("name");
	textLabel.textContent = data.model;

	item.appendChild(textLabel);

	// create price label for item
	// TODO: optional check
	const priceLabel = document.createElement("div");

	priceLabel.classList.add("price");
	priceLabel.textContent = data.price;

	item.appendChild(priceLabel);

	items.appendChild(item);
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

	const items = slider.children[1];

	if (items == null)
	{
		throw `slider element with id "${id}" doesn't have items container`;
	}

	if (empty == true)
	{
		// remove all child elements from items container
		while (items.firstChild != null)
		{
			items.removeChild(items.lastChild);
		}
	}

	// add items
	for (let i = 0; i < values.length; i++)
	{
		add(slider, values[i], i);
	}

	// add selected class to first child
	// only if list was emptied
	if (empty == true)
	{
		items.firstChild.classList.add("selected");
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
	};

	// append to slider
	slider.appendChild(container);
}

/**
 * Create a slider
 * @param {string} id slider element id
 * @param {HTMLElement} parent parent element to append slider
 * @param {object[]} [values] collection of slider items
 * @param {number} [numVisible] number of items to show by default
 */
function create(id, parent, values, numVisible = 5)
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

	numVisible = parseInt(numVisible);

	// ensure numVisible param is a number
	if (isNaN(numVisible))
	{
		throw `numVisible param must be a number "${numVisible}"`;
	}

	if (numVisible <= 0)
	{
		throw `numVisible param must be greater than 0`;
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
	items.dataset.visible = numVisible;

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