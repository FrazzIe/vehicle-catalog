/**
 * Class representing a slider
 */
class Slider
{
	static DEFAULT_NUM_VISIBLE = 5;
	static INDEX_CHANGED_EVENT = "SliderIndexChanged";

	#index;
	#min;
	#max;
	#numVisible;

	/**
	 * Create a slider
	 * @param {string} id slider element id
	 * @param {object[]} [values] collection of slider items
	 * @param {number} [numVisible] number of items to show by default
	 */
	constructor(id, values, numVisible)
	{
		if (id == null)
		{
			throw "slider element id is null";
		}

		this.#numVisible = parseInt(numVisible);

		if (isNaN(this.#numVisible) || this.#numVisible <= 0)
		{
			this.#numVisible = Slider.DEFAULT_NUM_VISIBLE;
		}

		this.domElement = document.createElement("div");

		this.domElement.id = id;
		this.domElement.classList.add("slider");

		// left arrow
		this.#arrow(true);

		// items container
		const items = document.createElement("div");

		items.id = `${this.domElement.id}-items`;
		items.classList.add("item-container");
		items.dataset.visible = this.#numVisible;

		this.domElement.appendChild(items);

		// right arrow
		this.#arrow(false);

		this.populate(values);
	}

	/**
	 * Create a slider arrow
	 * @param {bool} left arrow direction
	 */
	#arrow(left)
	{
		let direction;
		let amount;
	
		if (left)
		{
			direction = "left";
			amount = -1;
		}
		else
		{
			direction = "right";
			amount = 1;
		}

		// create arrow container
		const container = document.createElement("div");

		container.id = `${this.domElement.id}-arrow-${direction}`;
		container.classList.add("arrow-container");

		// create arrow
		// append to container
		const arrow = document.createElement("div");

		arrow.classList.add("arrow", direction);

		container.appendChild(arrow);

		// container onclick
		container.onclick = () =>
		{
			this.change(amount);
		};

		// append to slider
		this.domElement.appendChild(container);
	}

	/**
	 * Set selected item index
	 * @param {number} idx slider item index
	 * @param {bool} [delay] delay previous item index
	 */
	#setIndex(idx, delay = false)
	{
		const items = this.domElement.children[1];
	
		if (items == null)
		{
			throw `slider element with id "${this.domElement.id}" doesn't have items container`;
		}	

		// change selected element
		const last = items.children[this.#index];
		const next = items.children[idx];
	
		if (last != null)
		{
			last.classList.remove("selected");
	
			if (delay)
			{
				last.classList.add("previous");
	
				setTimeout(() => last.classList.remove("previous"), 20);
			}
		}
	
		if (next != null)
		{
			next.classList.add("selected");
		}
	
		const customEvent = new CustomEvent(Slider.INDEX_CHANGED_EVENT,
		{
			detail: {
				old: this.#index,
				new: idx
			}
		});

		// store new index
		this.#index = idx;
		items.dataset.index = idx;

		this.domElement.dispatchEvent(customEvent);
	}

	/**
	 * Add item to slider
	 * @param {object} data slider item data
	 * @param {string} data.model vehicle model
	 * @param {string} [data.label] vehicle label
	 * @param {number} [data.price] vehicle price
	 * @param {number} idx slider item index
	 */
	#add(data, idx)
	{
		const items = this.domElement.children[1];

		if (items == null)
		{
			throw `slider element with id "${this.domElement.id}" doesn't have items container`;
		}

		if (idx == null)
		{
			throw "slider item index is null";
		}

		// create item
		const item = document.createElement("div");

		item.classList.add("item");
		item.id = `${items.id}-${idx}`;

		item.onclick = () =>
		{
			this.#setIndex(idx);
		};

		// create image for item
		const image = document.createElement("img");

		// load default image on error
		image.onerror = function()
		{
			image.onerror = null;
			image.src = "img/default.webp";
			image.alt = "A default image";
		};

		// prevent image drag
		image.ondragstart = function()
		{
			return false;
		};

		image.src = `img/${data.model}.webp`;
		image.alt = `An image of a ${data.model ?? "vehicle"}`;

		item.appendChild(image);

		// create text label for item
		const textLabel = document.createElement("div");

		textLabel.classList.add("name");
		textLabel.textContent = data.label ?? data.model;

		item.appendChild(textLabel);

		// create price label for item
		if (data.price != null)
		{
			const priceLabel = document.createElement("div");

			priceLabel.classList.add("price");
			priceLabel.textContent = data.price;
	
			item.appendChild(priceLabel);
		}

		items.appendChild(item);	
	}

	/**
	 * Add items to slider
	 * @param {object[]} values collection of slider items
	 */
	populate(values) 
	{
		if (values == null || values.length == 0)
		{
			return;
		}

		const items = this.domElement.children[1];

		if (items == null)
		{
			throw `slider element with id "${this.domElement.id}" doesn't have items container`;
		}

		// remove all child elements from items container
		while (items.firstChild != null)
		{
			items.removeChild(items.lastChild);
		}

		// add items
		for (let i = 0; i < values.length; i++)
		{
			this.#add(values[i], i);
		}

		this.#index = 0;
		this.#min = 0;

		// set max
		if (items.children.length < this.#numVisible)
		{
			this.#max = items.children.length - 1;
		}
		else
		{
			this.#max = this.#numVisible - 1;
		}

		// add selected class to first child
		items.firstChild.classList.add("selected");

		// set element data attributes
		items.dataset.index = this.#index;
		items.dataset.min = this.#min;
		items.dataset.max = this.#max;

		// show visible items
		for (let i = this.#min; i <= this.#max; i++)
		{
			items.children[i].classList.add("visible");
		}
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

		const items = this.domElement.children[1];

		if (items == null)
		{
			throw `slider element with id "${this.domElement.id}" doesn't have items container`;
		}

		const numItems = items.children.length;
		const increment = Math.abs(amount) % numItems;
		
		let newIndex;
		let newMinIndex = this.#min;
		let newMaxIndex = this.#max;

		// calc new index
		if (amount > 0)
		{
			newIndex = this.#index + increment;

			// calc new max & min
			if (newIndex > this.#max)
			{
				newMaxIndex = newIndex;
				newMinIndex = this.#min + (newMaxIndex - this.#max);
			}
		}
		else
		{
			newIndex = this.#index - increment;

			if (newIndex < this.#min)
			{
				newMinIndex = newIndex;
				newMaxIndex = this.#max - (this.#min - newMinIndex);
			}
		}

		// clamp index in between 0 and numItems
		if (newIndex >= numItems)
		{
			newIndex -= numItems;
			newMaxIndex -= numItems;
			newMinIndex -= numItems;

			// prevent min being negative
			if (newMinIndex < 0)
			{
				newMaxIndex -= newMinIndex;
				newMinIndex -= newMinIndex;
			}
		}
		else if (newIndex < 0)
		{
			newIndex = numItems + newIndex;
			newMinIndex = numItems + newMinIndex;
			newMaxIndex = numItems + newMaxIndex;

			// prevent max being greater than numItems
			if (newMaxIndex >= numItems)
			{
				newMinIndex -= newMaxIndex - newIndex;
				newMaxIndex = newIndex;
			}
		}
		
		let useDelay = false;

		// change item visibility
		if (this.#min != newMinIndex || this.#max != newMaxIndex)
		{
			// hide visible items
			for (let i = this.#min; i <= this.#max; i++)
			{
				items.children[i].classList.remove("visible");
			}

			// show visible items
			for (let i = newMinIndex; i <= newMaxIndex; i++)
			{
				items.children[i].classList.add("visible");
			}

			// set min + max
			this.#min = newMinIndex;
			this.#max = newMaxIndex;

			// set element data attributes
			items.dataset.min = newMinIndex;
			items.dataset.max = newMaxIndex;

			useDelay = true;
		}

		this.#setIndex(newIndex, useDelay);
	}
}

export default Slider;