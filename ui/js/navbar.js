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
	if (id == null)
	{
		throw "nav element id is null";
	}

	const nav = document.getElementById(id);

	if (nav == null)
	{
		throw `nav element with id "${id}" doesn't exist`;
	}

	if (values == null || values.length == 0)
	{
		return;
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
 * add/subtract selected item index
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

}