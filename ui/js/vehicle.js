import Stats from "./stats.js";

let label;
let stats;

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

	// TODO: colour panel

	// create panel select button
	const select = document.createElement("button");

	select.id = `${panel.id}-select-btn`;
	select.classList.add("button");

	panel.appendChild(select);

	return panel;
}

export { label, stats, create };