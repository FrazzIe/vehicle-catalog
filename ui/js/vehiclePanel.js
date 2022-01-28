import Stats from "./stats.js";

let label;
let stats;
let button;

/**
 * Create vehicle information panel
 * @returns {HTMLDivElement} panel element
 */
function create()
{
	const panel = document.createElement("div");

	panel.id = "vehicle-panel";
	panel.classList.add("vehicle-panel");

	// create panel heading
	const heading = document.createElement("div");

	heading.id = `${panel.id}-heading`;
	heading.classList.add("heading");

	label = document.createElement("div");

	label.textContent = "VEHICLE_NAME_PLACEHOLDER";

	heading.appendChild(label);

	panel.appendChild(heading);

	// create panel stats
	stats = new Stats(`${panel.id}-vehicle-stats`, [ "FMMC_VEHST_0", "FMMC_VEHST_1", "FMMC_VEHST_2", "FMMC_VEHST_3" ])

	panel.appendChild(stats.domElement);

	// create panel select button
	button = document.createElement("button");

	button.id = `${panel.id}-select-btn`;
	button.classList.add("button");

	panel.appendChild(button);

	return panel;
}

export { label, stats, button, create };