/**
 * Class representing a navbar
 */
class Navbar
{
	static INDEX_CHANGED_EVENT = "NavbarIndexChanged";

	#index;

	/**
	 * Create a navbar
	 * @param {string} id nav element id
	 * @param {string[]} [values] collection of nav items
	 */
	constructor(id, values)
	{
		if (id == null)
		{
			throw "nav element id is null";
		}

		this.domElement = document.createElement("div");

		this.domElement.id = id;
		this.domElement.classList.add("navbar");
		
		this.populate(values);
	}

	/**
	 * Set selected item index
	 * @param {number} idx nav item index
	 */
	#setIndex(idx)
	{
		// change selected element
		const last = this.domElement.children[this.#index];
		const next = this.domElement.children[idx];

		if (last != null)
		{
			last.classList.remove("selected");
		}

		if (next != null)
		{
			next.classList.add("selected");
		}

		const customEvent = new CustomEvent(Navbar.INDEX_CHANGED_EVENT, {
			detail: {
				old: this.#index,
				new: idx
			}
		});

		// store new index
		this.#index = idx;
		this.domElement.dataset.index = idx;

		this.domElement.dispatchEvent(customEvent);		
	}

	/**
	 * Add item to navbar
	 * @param {string} text nav item text
	 * @param {number} idx nav item index
	 */
	#add(text, idx)
	{
		if (idx == null)
		{
			throw "nav item index is null";
		}

		// create item
		const item = document.createElement("div");

		item.classList.add("item");
		item.id = `${this.domElement.id}-${idx}`;
		item.textContent = text;

		item.onclick = () =>
		{
			this.#setIndex(idx);
		};

		this.domElement.appendChild(item);
	}

	/**
	 * Add items to navbar
	 * @param {string[]} values collection of nav items
	 */
	populate(values) 
	{
		if (values == null || values.length == 0)
		{
			return;
		}

		// remove all child elements from nav
		while (this.domElement.firstChild != null)
		{
			this.domElement.removeChild(this.domElement.lastChild);
		}

		// add items
		for (let i = 0; i < values.length; i++)
		{
			this.#add(values[i], i);
		}

		// set index
		this.#index = 0;

		// add selected class to first child
		this.domElement.firstChild.classList.add("selected");
		this.domElement.dataset.index = this.#index;
	}

	/**
	 * Add/Subtract selected item index
	 * @param {number} amount amount to change
	 */
	change(amount)
	{
		// don't accept 0
		if (amount == 0)
		{
			return;
		}

		const numItems = this.domElement.children.length;
		const increment = Math.abs(amount) % numItems;
		
		let newIndex;

		// calc new index
		if (amount > 0)
		{
			newIndex = this.#index + increment;
		}
		else
		{
			newIndex = this.#index - increment;
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

		this.#setIndex(newIndex);
	}
}