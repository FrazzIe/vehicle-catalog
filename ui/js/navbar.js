/**
 * Add items to navbar
 * @param {string} id nav element id
 * @param {string[]} values collection of nav items
 */
function populate(id, values) 
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
}