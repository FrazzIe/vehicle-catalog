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
	
	load()
	{

	}

	update()
	{

	}
}

/**
 * Update vehicle statstics bars
 * @param {number[]} values Array of bar percentages
 */
export function update(values) {
	const stats = document.querySelector(".stats-container");

	for (let i = 0; i < values.length; i++) {
		const stat = stats.children[i];
		const bars = stat.children[1];

		const numBars = bars.children.length;
		const oneFilled = (100.0 / numBars);
		const floatFilled = values[i] / oneFilled;
		const numFilled = Math.trunc(floatFilled);
		const partialFilled = floatFilled % 1;
		const numEmpty = Math.trunc(numBars - floatFilled);

		// skip if bar is empty
		if (numEmpty != numBars) {
			// set filled bars
			for (let j = 0; j < numFilled; j++) {
				bars.children[j].children[0].style.width = "100%";
			}
			
			// skip if not partial is needed
			if (numFilled + numEmpty != numBars) {
				// set partially filled bar
				if (bars.children[numFilled] != null) {
					bars.children[numFilled].children[0].style.width = `${Math.trunc(partialFilled * 100.0)}%`;
				}
			}
		}
		
		// set empty bars
		for (let j = numBars - numEmpty; j < numEmpty; j++) {
			bars.children[j].children[0].style.width = "0%";
		}
	}
}

/**
 * Initialise vehicle statistics pane
 * @param {string[]} labels Array of resolved stat labels
 */
export function init(labels) {
	const stats = document.querySelector(".stats-container");

	for (let i = 0; i < labels.length; i++) {
		const stat = document.createElement("div");
		const label = document.createElement("div");
		const bars = document.createElement("div");

		stat.classList.add("item");
		label.classList.add("label");
		bars.classList.add("bar-container");
		
		label.textContent = labels[i];

		for (let j = 0; j < 5; j++) {
			const bar = document.createElement("div");
			const fill = document.createElement("div");

			bar.classList.add("bar");
			fill.classList.add("fill");

			bar.appendChild(fill);
			bars.appendChild(bar);
		}

		stat.appendChild(label);
		stat.appendChild(bars);
		stats.appendChild(stat);
	}
}