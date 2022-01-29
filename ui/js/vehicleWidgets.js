import Stats from "./stats.js";

let label;
let close;
let stats;
let price;
let button;

/**
 * Create vehicle information widgets
 * @returns {HTMLDivElement} widget container element
 */
function create()
{
	const widgets = document.createElement("div");

	widgets.id = "vehicle-widgets";

	// label widget
	label = document.createElement("div");

	label.id = `${widgets.id}-label`;
	label.classList.add("widget", "label");
	label.textContent = "VEHICLE_NAME_PLACEHOLDER";
	
	// close widget
	close = document.createElement("button");

	close.id = `${widgets.id}-close`;
	close.classList.add("widget", "right", "transparent", "close-btn");
	
	// constrain transform rotate
	const innerClose = document.createElement("div");

	innerClose.textContent = "+";

	close.appendChild(innerClose);

	label.appendChild(close);

	widgets.appendChild(label);

	// stats + price container
	const container = document.createElement("div");

	container.classList.add("widget", "bottom", "transparent", "gap", "no-padding");

	// stats widget
	const statsContainer = document.createElement("div");

	statsContainer.classList.add("widget", "stats");

	const statsLabel = document.createElement("div");

	statsLabel.textContent = "Stats";

	statsContainer.appendChild(statsLabel);

	stats = new Stats(`${widgets.id}-stats`, [ "FMMC_VEHST_0", "FMMC_VEHST_1", "FMMC_VEHST_2", "FMMC_VEHST_3" ]);

	statsContainer.appendChild(stats.domElement);

	container.appendChild(statsContainer);

	// price widget
	price = document.createElement("div");

	price.id = `${widgets.id}-price`;
	price.classList.add("widget", "price", "transparent");

	container.appendChild(price);

	widgets.appendChild(container);

	// select-btn widget
	button = document.createElement("button");

	button.id = `${widgets.id}-select-btn`;
	button.classList.add("widget", "bottom", "right", "select-btn");
	button.textContent = "Select";

	widgets.appendChild(button);

	return widgets;
}

export { label, close, stats, price, button, create };