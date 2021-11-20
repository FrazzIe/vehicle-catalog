import { data } from "./data.js";

const numVehicles = 5;

let app = document.getElementById("app");
let selectedCategory;
let vehicleElements;
let vehicleMinIdx;
let vehicleMaxIdx;
let vehicleIdx;

function show(val) {
	let show = val === true;
	if (show)
		app.style.display = "initial";
	else
		app.style.display = "none";
}

function onImageError(event) {
	event.target.onerror = null;
	event.target.src = "../img/default.png";
}

function populateVehicles(idx) {
	if (!vehicleElements) {
		vehicleMinIdx = 0;
		vehicleMaxIdx = numVehicles - 1;
		vehicleIdx = 0;
		vehicleElements = [];

		let container = app.querySelector(".veh-item-container");

		for (let i = 0; i < numVehicles; i++) {
			let item = document.createElement("div");
			let image = document.createElement("img");
			let label = document.createElement("div");
			let vehicle = data.vehicles[idx][i];

			if (!vehicle)
				continue;

			image.onerror = onImageError;
			image.src = `../img/${vehicle.model}.png`;

			label.textContent = vehicle.model;

			item.classList.add("veh-item");
			if (i == 0) 
				item.classList.add("veh-selected");
			item.appendChild(image);
			item.appendChild(label);
			container.appendChild(item);
			vehicleElements.push(item);
		}

		return;
	}

	let selectedVehicle = vehicleElements[vehicleIdx - vehicleMinIdx];
	vehicleMinIdx = 0;
	vehicleMaxIdx = numVehicles - 1;
	vehicleIdx = 0;

	for (let i = 0; i < vehicleElements.length; i++) {
		let item = vehicleElements[i];
		let image = item.children[0];
		let label = item.children[1];
		let vehicle = data.vehicles[idx][i];

		if (!vehicle)
			continue;

		image.onerror = onImageError;
		image.src = `../img/${vehicle.model}.png`;

		label.textContent = vehicle.model;

		if (i == 0) {
			selectedVehicle.classList.remove("veh-selected");
			item.classList.add("veh-selected");
		}
	}
}

function onCategoryClicked(event) {
	let target = event.target;
	let idx = target.dataset.idx;

	if (data.vehicles.length <= idx)
		return;

	if (selectedCategory != null) {
		selectedCategory.classList.remove("class-selected");
	}

	selectedCategory = target;
	selectedCategory.classList.add("class-selected");

	populateVehicles(idx);
}

function populateCategories() {
	let container = app.querySelector(".class-container");
	let numCategories = data.categories.length;

	if (numCategories == 0)
		return;
	
	let item = document.createElement("button");

	item.classList.add("class-item", "class-selected");
	item.textContent = data.categories[0];
	item.dataset.idx = 0;
	item.onclick = onCategoryClicked;

	container.appendChild(item);
	selectedCategory = item;
	
	if (numCategories > 1) {
		for (let i = 1; i < numCategories; i++) {
			let item = document.createElement("button");

			item.classList.add("class-item");
			item.textContent = data.categories[i];
			item.dataset.idx = i;
			item.onclick = onCategoryClicked;

			container.appendChild(item);
		}
	}

	populateVehicles(0);
}

function init() {
	// show(false);
	populateCategories();
}

init();