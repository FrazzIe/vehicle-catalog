const numVehicles = 5;
const resourceName = "GetParentResourceName" in window ? GetParentResourceName() : false;

let vehicles = [];
let imageType;
let vehicleElements;
let vehicleIndexes;
let vehicleIdx;
let categoryIdx;
let onVehicleChanged;

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
	setVehicleIdx(idx);
}

function onImageError(event) {
	let target = event.currentTarget;
	target.onerror = null;
	target.src = "./img/default.png";
}

function onImageDrag() {
	return false;
}

function setVehicles(data) {
	vehicles = data;
}

function setImageType(data) {
	imageType = data;
}

function setVehicleIdx(idx) {
	vehicleIdx = idx;

	if (onVehicleChanged)
		onVehicleChanged(idx);

	if (vehicles[categoryIdx] == null || vehicleIndexes[idx] == null)
		return;

	if (resourceName == false)
		return;

	fetch(`https://${resourceName}/indexChanged`, {
		method: "POST",
		body: JSON.stringify(vehicles[categoryIdx][vehicleIndexes[idx]] ?? { error: true })
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		console.log(data)
	}).catch(function(err) {
		console.log(err);
	});
}

// issue: select middle use changeSlider(+4) only item 0,1 should change so [numVehicles - (current index + 1)]
function changeSlider(increment, _category) {
	let category = _category;

	if (!_category && categoryIdx != null)
		category = categoryIdx;

	if (!vehicles[category])
		return;

	let idx = vehicleIdx + increment;

	if (vehicles[category].length <= numVehicles) {
		if (idx >= vehicles[category].length)
			idx = 0;
		else if (idx < 0)
			idx = vehicles[category].length - 1;
		
		vehicleElements[vehicleIdx].classList.remove("selected");
		vehicleElements[idx].classList.add("selected");
		setVehicleIdx(idx);
		return;
	}

	if (idx >= 0 && idx < vehicleIndexes.length) {
		vehicleElements[vehicleIdx].classList.remove("selected");
		vehicleElements[idx].classList.add("selected");
		setVehicleIdx(idx);
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

			if (newIdx >= vehicles[category].length)
				newIdx -= vehicles[category].length;
			
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
				newIdx = vehicles[category].length - 1;

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
		let vehicle = vehicles[category][vehicleIndexes[i]];

		if (!vehicle)
			continue;

		image.onerror = onImageError;
		image.src = `./img/${vehicle.model}${vehicle.fileType ?? imageType}`;

		label.textContent = vehicle.model;

		if (i == idx) {
			vehicleElements[vehicleIdx].classList.remove("selected");
			item.classList.add("selected");
		}
	}

	setVehicleIdx(idx);
}

function populateVehicles(idx) {
	categoryIdx = idx;

	if (!vehicleElements) {
		vehicleElements = [];
		vehicleIndexes = [];
		vehicleIdx = 0;

		let container = document.querySelector(".item-container");

		for (let i = 0; i < numVehicles; i++) {
			let item = document.createElement("div");
			let image = document.createElement("img");
			let label = document.createElement("div");
			let vehicle = vehicles[idx][i];

			image.onerror = onImageError;
			image.ondragstart = onImageDrag;

			if (vehicle) {
				image.src = `./img/${vehicle.model}${vehicle.fileType ?? imageType}`;
				label.textContent = vehicle.model;
				vehicleIndexes.push(i);
				item.style.visibility = "visible";
			} else {
				item.style.visibility = "hidden";
			}

			item.classList.add("item");
			if (i == 0)
				item.classList.add("selected");
			item.dataset.idx = i;
			item.onclick = onVehicleClicked;
			item.appendChild(image);
			item.appendChild(label);
			container.appendChild(item);
			vehicleElements.push(item);
		}

		return;
	}

	let selectedVehicle = vehicleElements[vehicleIdx];
	vehicleIndexes = [];

	for (let i = 0; i < vehicleElements.length; i++) {
		let item = vehicleElements[i];
		let image = item.children[0];
		let label = item.children[1];
		let vehicle = vehicles[idx][i];

		image.onerror = onImageError;

		if (vehicle) {
			image.src = `./img/${vehicle.model}${vehicle.fileType ?? imageType}`;
			label.textContent = vehicle.model;
			item.style.visibility = "visible";
			vehicleIndexes.push(i);
		} else {
			item.style.visibility = "hidden";
		}

		if (i == 0) {
			selectedVehicle.classList.remove("selected");
			item.classList.add("selected");
		}
	}

	setVehicleIdx(0);
}

function setOnVehicleChangedCallback(callback) {
	onVehicleChanged = callback;
}

function getSelectedVehicleElement() {
	return vehicleElements[vehicleIdx];
}

export { setVehicles, setImageType, setVehicleIdx, changeSlider, populateVehicles, setOnVehicleChangedCallback, getSelectedVehicleElement };