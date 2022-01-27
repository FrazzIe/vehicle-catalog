/**
 * Class representing a statistics panel
 */
class Stats
{
	static DEFAULT_NUM_BARS = 5;
	static MAX_NUM_BARS = 12;

	#numBars;
	#fields;

	/**
	 * Create a statistics panel
	 * @param {string} id stats element id
	 * @param {string[]} fields collection of stat fields
	 * @param {number} numBars number of stats bar segments
	 */
	constructor(id, fields, numBars)
	{
		if (id == null)
		{
			throw "stats element id is null";
		}

		if (fields == null || fields.length == 0)
		{
			throw "stats must have at least 1 field"
		}

		this.#numBars = parseInt(numBars);

		if (isNaN(this.#numBars) || this.#numBars <= 0)
		{
			this.#numBars = Stats.DEFAULT_NUM_BARS;
		}

		if (this.#numBars > Stats.MAX_NUM_BARS)
		{
			this.#numBars = Stats.MAX_NUM_BAR;
		}

		this.#fields = {};

		// create DOM object
		this.domElement = document.createElement("div");

		this.domElement.id = id;
		this.domElement.classList.add("stats");

		// add fields
		for (let i = 0; i < fields.length; i++)
		{
			const field = fields[i];

			// skip invalid/empty field
			if (field == null || field == "")
			{
				continue;
			}

			// store field
			this.#fields[this.#fields.length] = field;

			// add field to DOM
			const item = document.createElement("div");

			item.id = `${this.domElement.id}-field-${i}`;
			item.classList.add("item");

			const label = document.createElement("div");

			label.id = `${item.id}-label`;
			label.classList.add("label");
			label.textContent = field;

			item.appendChild(label);

			const bars = document.createElement("div");

			bars.id = `${item.id}-bars`;
			bars.classList.add("bar-container");

			// add bar segments
			for (let j = 0; j < this.#numBars; j++)
			{
				const bar = document.createElement("div");

				bar.id = `${bars.id}-${j}`;
				bar.classList.add("bar");

				const fill = document.createElement("div");

				fill.id = `${bar.id}-fill`;
				fill.classList.add("fill");

				bar.appendChild(fill);

				bars.appendChild(bar);
			}

			item.appendChild(bars);

			this.domElement.appendChild(item);
		}
	}
	
	/**
	 * Resolve field labels
	 * 
	 * Sends field labels to game script to be resolved
	 */
	load()
	{
		const resourceName = "GetParentResourceName" in window ? window.GetParentResourceName() : null;

		if (resourceName == null)
		{
			return;
		}

		fetch(`https://${resourceName}/resolveStatLabels`, {
			method: "POST",
			body: JSON.stringify(this.#fields)
		})
		.then(response => response.json())
		.then(data => {
			if (data == null)
			{
				return;
			}

			if (data.length != this.#fields.length)
			{
				return;
			}

			// update fields with resolved labels
			for (let i = 0; i < data.length; i++)
			{
				const field = this.domElement.children[i];

				field.children[0].textContent = data[i] ?? this.#fields[i];
			}
		});
	}

	/**
	 * Update field bars
	 * @param {number[]} values Array of bar percentages
	 */
	update(values)
	{
		if (values == null || values.length == 0)
		{
			return;
		}

		let numValues = this.values.length;

		// prevent looping through invalid fields
		if (numValues > this.#fields.length)
		{
			numValues = this.#fields.length;
		}

		for (let i = 0; i < numValues; i++)
		{
			// parse value
			const value = parseFloat(values[i]);

			// cancel if NaN
			if (isNaN(value))
			{
				break;
			}

			// cancel if out of bounds
			if (value < 0.0 || value > 100.0)
			{
				break;
			}

			const field = this.domElement.children[i];
			const bars = field.children[1];

			const numBars = bars.children.length;
			const oneFilled = (100.0 / numBars);
			const floatFilled = value / oneFilled;
			const numFilled = Math.trunc(floatFilled);
			const partialFilled = floatFilled % 1;
			const numEmpty = Math.trunc(numBars - floatFilled);

			// skip if bar is empty
			if (numEmpty != numBars)
			{
				// set filled bars
				for (let j = 0; j < numFilled; j++)
				{
					bars.children[j].children[0].style.width = "100%";
				}

				// skip if partial is not needed
				if (numFilled + numEmpty != numBars)
				{
					// set partially filled bar
					if (bars.children[numFilled] != null)
					{
						bars.children[numFilled].children[0].style.width = `${Math.trunc(partialFilled * 100.0)}%`;
					}
				}
			}

			// set empty bars
			for (let j = numBars - numEmpty; j < numEmpty; j++)
			{
				bars.children[j].children[0].style.width = "0%";
			}
		}
	}
}

export default Stats;