import { data } from "./data.js";

const numVehicles = 5;

let app = document.getElementById("app");
let selectedCategory;
let vehicleElements;
let vehicleIndexes;
let vehicleIdx;

function show(val) {
	let show = val === true;
	if (show)
		app.style.display = "initial";
	else
		app.style.display = "none";
}

function changeSlider(category, increment) {
	if (!data.vehicles[category])
		return;

	let idx = vehicleIdx + increment; //0-4 + (amount) // 3 (4) + 3 = 6 (7) 6 - (5 - 1) = 2  // 3 + 8 = 11 (12) - (5 - 1) = 7

	//if change will past max
	if (idx >= vehicleIndexes.length) {
		//amount of items to remove from array
		let deleteCount = increment;

		if (deleteCount > vehicleIndexes.length)
			deleteCount = vehicleIndexes.length;
		
		//add each new item in
		for (let i = 0; i < increment; i++) {
			let lastIdx = vehicleIndexes[vehicleIndexes.length - 1];
			let newIdx = lastIdx + 1;

			if (newIdx >= data.vehicles[category].length)
				newIdx -= data.vehicles[category].length;
			
			vehicleIndexes.push(newIdx);
		}

		//delete redundent items
		vehicleIndexes.splice(0, deleteCount);

		idx = vehicleIndexes.length - 1;
	}

	if (idx < 0) {
		//amount of items to remove from array
		let deleteCount = increment;
		
		if (deleteCount < -vehicleIndexes.length)
			deleteCount = -vehicleIndexes.length;

		console.log(`delete: ${deleteCount}`);
		for (let i = increment; i < 0; i++) {
			console.log(`increment: ${i}`);
			let firstIdx = vehicleIndexes[0];
			let newIdx = firstIdx - 1;

			if (newIdx < 0)
				newIdx = data.vehicles[category].length - 1;

			vehicleIndexes.splice(0, 0, newIdx);
		}

		//delete redundent items
		vehicleIndexes.splice(deleteCount);

		idx = 0;
	}

	for (let i = 0; i < vehicleIndexes.length; i++) {
		let item = vehicleElements[i];
		let image = item.children[0];
		let label = item.children[1];
		let vehicle = data.vehicles[category][vehicleIndexes[i]];

		if (!vehicle)
			continue;

		image.onerror = onImageError;
		image.src = `../img/${vehicle.model}.png`;

		label.textContent = vehicle.model;
	}

	vehicleIdx = idx;
}

function setupArrows() {
	let leftArrow = document.querySelector(".veh-arrow.left");
	let rightArrow = document.querySelector(".veh-arrow.right");

	leftArrow.onclick = function(event) {
		console.log(event);
		let category = selectedCategory.dataset.idx;
		changeSlider(category, -1);
	}
	
	rightArrow.onclick = function(event) {
		console.log(event);
		let category = selectedCategory.dataset.idx;
		changeSlider(category, 5);
	}
}

function onVehicleClicked(event) {
	let target = event.currentTarget;
	let idx = parseInt(target.dataset.idx);

	if (isNaN(idx))
		return;

	if (!vehicleElements[idx])
		return;

	let selectedVehicle = vehicleElements[vehicleIdx];

	if (target == selectedVehicle)
		return;
	
	selectedVehicle.classList.remove("veh-selected");
	target.classList.add("veh-selected");
	vehicleIdx = idx;
}

function onImageError(event) {
	let target = event.currentTarget;
	target.onerror = null;
	target.src = "../img/default.png";
}

function populateVehicles(idx) {
	if (!vehicleElements) {
		vehicleElements = [];
		vehicleIndexes = [];
		vehicleIdx = 0;

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
			item.dataset.idx = i;
			item.onclick = onVehicleClicked;
			item.appendChild(image);
			item.appendChild(label);
			container.appendChild(item);
			vehicleElements.push(item);
			vehicleIndexes.push(i);
		}

		return;
	}

	let selectedVehicle = vehicleElements[vehicleIdx];
	vehicleIndexes = [];
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

		vehicleIndexes.push(i);
	}
}

function onCategoryClicked(event) {
	let target = event.currentTarget;
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
	setupArrows();
}

init();