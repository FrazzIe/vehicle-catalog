// TODO: Vehicle information panel (stats, name)
// TODO: Select vehicle button
// TODO: Exit/Close button
// TODO: Fetch vehicle label names
// TODO: Optional vehicle price support (show price of vehicle next to label)
import { data } from "../../vehicles.js";
import { startGamepadListener, stopGamepadListener } from "./gamepad.js";
import { generateVehicleImages } from "./screenshot.js";
import { setCategories, changeCategory, populateCategories, setOnCategoryChangedCallback, getSelectedCategoryElement } from "./category.js";
import { setVehicles, setImageType, setVehicleIdx, changeSlider, populateVehicles, setOnVehicleChangedCallback, getSelectedVehicleElement } from "./slider.js";


const buttonInterval = 140;
const axesInterval = 160;
const resourceName = "GetParentResourceName" in window ? GetParentResourceName() : false;
const app = document.getElementById("app");

let categoryIdx;
let vehicleIdx;
let buttonIntervals = [];
let axesIntervals = [];
let useSlider = false;

function getImageType() {
	switch(data.image.fileType) {
		case "png":
		case ".png":
			return ".png";
		case ".jpg":		
		case "jpg":
			return ".jpg";
		case ".jpeg":
		case "jpeg":
			return ".jpeg";
		case "webp":
		case ".webp":
			return ".webp";
		default:
			return ".png";
	}
}

function toggleHighlight(element) {
	if (!element)
		return;
	
	element.classList.add("active");

	setTimeout(function() {
		element.classList.remove("active");
	}, 200);
}

function onWheel(event) {
	if (event.deltaY < 0) {
		if (useSlider)
			changeSlider(-1);
		else
			changeCategory(-1);
	}
	else if (event.deltaY > 0) {
		if (useSlider)
			changeSlider(1);
		else
			changeCategory(1);
	}
}

function onKeyDown(event) {
	if (event.defaultPrevented)
		return;

	switch(event.key) {
		case "w":
		case "ArrowUp":
			useSlider = false;
			toggleHighlight(getSelectedCategoryElement());
			break;
		case "s":
		case "ArrowDown":
			useSlider = true;
			toggleHighlight(getSelectedVehicleElement());
			break;
		case "a":
		case "ArrowLeft":
			if (useSlider)
				changeSlider(-1);
			else
				changeCategory(-1);
			break;
		case "d":
		case "ArrowRight":
			if (useSlider)
				changeSlider(1);
			else
				changeCategory(1);
			break;
		case "Escape":
		case "Backspace":
			show(false);
			break;
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
		case 1:
		case 8:
			show(false);
			break;
	}
}

function onGameButtonReleased(buttonIdx, value, data) {
	delete buttonIntervals[buttonIdx];
}

function onGamepadAxisActive(axisId, value) {	
	let now = performance.now();

	if (axesIntervals[axisId] && now - axesIntervals[axisId] <= axesInterval) {
		return;
	}

	axesIntervals[axisId] = now;

	switch(axisId) {
		case 0:
			let increment = value < 0 ? -1 : 1;
			if (useSlider)
					changeSlider(increment)
				else
					changeCategory(increment)
			break;
		case 3:
			if (value < 0) {
				useSlider = false;
				toggleHighlight(getSelectedCategoryElement());
			} else {
				useSlider = true;
				toggleHighlight(getSelectedVehicleElement());
			}
			break;			
	}
}

function setupArrows() {
	let leftArrow = document.getElementById("arrow-left");
	let rightArrow = document.getElementById("arrow-right");

	leftArrow.onclick = function() {
		changeSlider(-1);
	}
	
	rightArrow.onclick = function() {
		changeSlider(1);
	}
}

function onCategoryChanged(idx) {
	categoryIdx = idx;
	populateVehicles(idx);
}

function onVehicleChanged(idx) {
	vehicleIdx = idx;
}

function show(val, preventRequest = false) {
	let show = val === true;
	if (show) {
		app.style.display = "block";
		window.addEventListener("keydown", onKeyDown, false);
		window.addEventListener("wheel", onWheel, false);
		startGamepadListener({
			onGamepadButtonPressed: onGamepadButtonPressed,
			onGameButtonReleased: onGameButtonReleased,
			onGamepadAxisActive: onGamepadAxisActive
		});
		setVehicleIdx(vehicleIdx);
	} else {
		app.style.display = "none";
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("wheel", onWheel);
		stopGamepadListener();

		if (!resourceName || preventRequest)
			return;

		fetch(`https://${resourceName}/close`, {
			method: "POST",
		}).then(function(response) {
			return response.json();
		}).then(function(data) {
			console.log(data);
		}).catch(function(err) {
			console.log(err);
		});
	}
}

function onNuiMessage(event) {
	const item = event.data || event.detail;

	switch(item.type) {
		case "Show":
			show(item.payload);
			break;
		case "GenerateVehicleImages":
			generateVehicleImages(item.payload, data.vehicles);
			break;
	}
}

function init() {
	window.addEventListener("message", onNuiMessage, false);

	show(false, true);
	show(true);
	setCategories(data.categories);
	setVehicles(data.vehicles);
	setImageType(getImageType());
	setOnCategoryChangedCallback(onCategoryChanged);
	setOnVehicleChangedCallback(onVehicleChanged);
	populateCategories();
	setupArrows();
}

init();