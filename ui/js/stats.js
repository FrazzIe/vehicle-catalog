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