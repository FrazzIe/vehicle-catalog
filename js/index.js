import { data } from "./data.js";
import { startGamepadListener, stopGamepadListener } from "./gamepad.js";

const numVehicles = 5;
const buttonThreshold = 0.12;
const buttonInterval = 140;

let app = document.getElementById("app");
let categoryElements;
let categoryIdx;
let vehicleElements;
let vehicleIndexes;
let vehicleIdx;
let buttonIntervals = [];

function changeCategory(increment) {
	let idx = (Math.abs(increment) % data.categories.length);

	if (increment < 0)
		idx = categoryIdx - idx;
	else
		idx = categoryIdx + idx;

	if (idx >= data.categories.length)
		idx -= data.categories.length;
	if (idx < 0)
		idx = data.categories.length + idx;

	if (categoryElements[categoryIdx])
		categoryElements[categoryIdx].classList.remove("selected");

	if (categoryElements[idx])
		categoryElements[idx].classList.add("selected");

	categoryIdx = idx;
	populateVehicles(idx);
}

// issue: select middle use changeSlider(+4) only item 0,1 should change so [numVehicles - (current index + 1)]
function changeSlider(increment, _category) {
	let category = _category;

	if (!_category && categoryIdx != null)
		category = categoryIdx;

	if (!data.vehicles[category])
		return;

	let idx = vehicleIdx + increment;

	if (idx >= 0 && idx < vehicleIndexes.length) {
		vehicleElements[vehicleIdx].classList.remove("selected");
		vehicleElements[idx].classList.add("selected");
		vehicleIdx = idx;
		return;
	}

	//if change will pass max
	if (idx >= vehicleIndexes.length) {
		//amount of items to remove from array
		let deleteCount = increment;

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

	//if change will pass min
	if (idx < 0) {
		//amount of items to remove from array
		let deleteCount = increment;

		for (let i = increment; i < 0; i++) {
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

		if (i == idx) {
			vehicleElements[vehicleIdx].classList.remove("selected");
			item.classList.add("selected");
		}
	}

	vehicleIdx = idx;
}

function onKeyDown(event) {
	if (event.defaultPrevented)
		return;

	switch(event.key) {

	}

	event.preventDefault();
}

function onGamepadButtonPressed(buttonIdx, value, data) {
	let now = performance.now();

	if (buttonIntervals[buttonIdx] && now - buttonIntervals[buttonIdx] <= buttonInterval) {
		return;
	}

	buttonIntervals[buttonIdx] = now;

	switch(buttonIdx) {
		case 14:
			changeSlider(-1);
			break;
		case 15:
			changeSlider(1);
			break;
		case 4:
			changeCategory(-1);
			break;
		case 5:
			changeCategory(1);			
			break;
	}
}

function onGameButtonReleased(buttonIdx, value, data) {
	delete buttonIntervals[buttonIdx];
}

function onGamepadTick(gamepads) {
	for (let idx in gamepads) {
		let pad = gamepads[idx];

		if (pad.mapping != "standard")
			continue;

		for (let i = 0; i < pad.buttons.length; i++) {
			let value = pad.buttons[i].value || pad.buttons[i];

			if (value && value > buttonThreshold)
				onGamepadButtonPressed(i, value, pad.buttons[i]);
			else
				onGameButtonReleased(i, value, pad.buttons[i]);
		}
	}
}

function setupArrows() {
	let leftArrow = document.querySelector(".arrow-container .arrow.left");
	let rightArrow = document.querySelector(".arrow-container .arrow.right");

	leftArrow.onclick = function() {
		changeSlider(-1);
	}
	
	rightArrow.onclick = function() {
		changeSlider(1);
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
	
	selectedVehicle.classList.remove("selected");
	target.classList.add("selected");
	vehicleIdx = idx;
}

function onImageError(event) {
	let target = event.currentTarget;
	target.onerror = null;
	target.src = "../img/default.png";
}

function onImageDrag() {
	return false;
}

function populateVehicles(idx) {
	if (!vehicleElements) {
		vehicleElements = [];
		vehicleIndexes = [];
		vehicleIdx = 0;

		let container = app.querySelector(".item-container");

		for (let i = 0; i < numVehicles; i++) {
			let item = document.createElement("div");
			let image = document.createElement("img");
			let label = document.createElement("div");
			let vehicle = data.vehicles[idx][i];

			if (!vehicle)
				continue;

			image.onerror = onImageError;
			image.src = `../img/${vehicle.model}.png`;
			image.ondragstart = onImageDrag;
			label.textContent = vehicle.model;

			item.classList.add("item");
			if (i == 0)
				item.classList.add("selected");
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
			selectedVehicle.classList.remove("selected");
			item.classList.add("selected");
		}

		vehicleIndexes.push(i);
	}
}

function onCategoryClicked(event) {
	let target = event.currentTarget;
	let idx = parseInt(target.dataset.idx);

	if (isNaN(idx))
		return;

	if (data.vehicles.length <= idx)
		return;

	if (categoryElements[categoryIdx])
		categoryElements[categoryIdx].classList.remove("selected");

	if (categoryElements[idx])
		categoryElements[idx].classList.add("selected");

	categoryIdx = idx;
	populateVehicles(idx);
}

function populateCategories() {
	let container = app.querySelector(".category-container");
	let numCategories = data.categories.length;

	if (numCategories == 0)
		return;		

	categoryElements = [];
	categoryIdx = 0;

	for (let i = 0; i < numCategories; i++) {
		let item = document.createElement("button");

		item.classList.add("item");
		item.textContent = data.categories[i];
		item.dataset.idx = i;
		item.onclick = onCategoryClicked;
		
		container.appendChild(item);
		categoryElements.push(item);
	}

	categoryElements[categoryIdx].classList.add("selected");

	populateVehicles(categoryIdx);
}

function show(val) {
	let show = val === true;
	if (show) {
		app.style.display = "initial";
		window.addEventListener("keydown", onKeyDown, false);
		startGamepadListener(onGamepadTick);
	} else {
		app.style.display = "none";
		window.removeEventListener("keydown", onKeyDown);
		stopGamepadListener();
	}
}

function init() {
	// show(false);
	populateCategories();
	setupArrows();
	startGamepadListener(onGamepadTick);
}

init();