/**
 * Add item to navbar
 * @param {HTMLDivElement} nav nav element
 * @param {string} text nav item text
 * @param {number} idx nav item index
 */
function add(nav, text, idx)
{
	if (nav == null)
	{
		throw `nav element is null`;
	}

	if (idx == null)
	{
		throw "nav item index is null";
	}

	// create item
	const item = document.createElement("div");

	item.classList.add("item");
	item.id = `${nav.id}-${idx}`;
	item.textContent = text;

	nav.appendChild(item);
}

/**
 * Add items to navbar
 * @param {string} id nav element id
 * @param {string[]} values collection of nav items
 * @param {bool} [empty] empty previous nav items
 */
function populate(id, values, empty = true) 
{
	if (values == null || values.length == 0)
	{
		return;
	}
	
	if (id == null)
	{
		throw "nav element id is null";
	}

	const nav = document.getElementById(id);

	if (nav == null)
	{
		throw `nav element with id "${id}" doesn't exist`;
	}

	if (empty == true)
	{
		// remove all child elements from nav
		while (nav.firstChild != null)
		{
			nav.removeChild(nav.lastChild);
		}
	}

	// add items
	for (let i = 0; i < values.length; i++)
	{
		add(nav, values[i], i);
	}

	// add selected class to first child
	// only if list was emptied
	if (empty == true)
	{
		nav.firstChild.classList.add("selected");
		nav.dataset.index = 0;
	}
}

/**
 * Add/Subtract selected item index
 * @param {string} id nav element id
 * @param {number} amount amount to increment
 */
function increment(id, amount)
{
	if (id == null)
	{
		throw "nav element id is null";
	}

	const nav = document.getElementById(id);

	if (nav == null)
	{
		throw `nav element with id "${id}" doesn't exist`;
	}

	const numItems = nav.children.length;
	const curIndex = parseInt(nav.dataset.index) ?? 0;
	const increment = Math.abs(amount) % numItems;
	
	let newIndex;

	// calc new index
	if (amount > 0)
	{
		newIndex = curIndex + increment;
	}
	else
	{
		newIndex = curIndex - increment;
	}

	// clamp index in between 0 and numItems
	if (newIndex >= numItems)
	{
		newIndex -= numItems;
	}
	else if (newIndex < 0)
	{
		newIndex = numItems + newIndex;
	}

	// change selected element
	const last = nav.children[curIndex];
	const next = nav.children[newIndex];

	if (last != null)
	{
		last.classList.remove("selected");
	}

	if (next != null)
	{
		next.classList.add("selected");
	}

	// store new index
	nav.dataset.index = newIndex;
}

/**
 * Create a navbar
 * @param {string} id nav element id
 * @param {HTMLElement} parent parent element to append navbar
 * @param {string[]} [values] collection of nav items
 */
function create(id, parent, values)
{
	if (id == null)
	{
		throw "nav element id is null";
	}

	if (parent == null)
	{
		throw "nav parent element is null";
	}

	if ((parent instanceof HTMLElement) == false)
	{
		throw "nav parent is not a HTMLElement";
	}

	const exists = document.getElementById(id);

	if (exists != null)
	{
		throw `nav element with id "${id}" already exists`;
	}

	const nav = document.createElement("div");

	nav.id = id;
	nav.classList.add("navbar");

	populate(id, values);

	parent.appendChild(nav);
}