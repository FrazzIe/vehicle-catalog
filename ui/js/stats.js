/**
 * Initialise vehicle statistics pane
 * @param {string[]} labels Array of resolved stat labels
 */
function init(labels) {
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

			bar.classList.add("bar");

			bars.appendChild(bar);
		}

		stat.appendChild(label);
		stat.appendChild(bars);
		stats.appendChild(stat);
	}
}