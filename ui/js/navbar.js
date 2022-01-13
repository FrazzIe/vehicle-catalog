/**
 * Add item to navbar
 * @param {string} id nav element id
 * @param {string} text nav item text
 * @param {number} [idx nav item index
 */
function add(id, text, idx)
{
	if (id == null)
	{
		throw "nav element id is null";
	}
	
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
}