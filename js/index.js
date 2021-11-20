import { data } from "./data.js";

let app = document.getElementById("app");

function show(val) {
	let show = val === true;
	if (show)
		app.style.display = "initial";
	else
		app.style.display = "none";
}

function populateCategories() {
	let container = app.querySelector(".class-container");
	let numCategories = data.categories.length;

	if (numCategories == 0)
		return;
	
	let item = document.createElement("button");

	item.classList.add("class-item", "class-selected");
	item.textContent = data.categories[0];

	container.appendChild(item);

	for (let i = 1; i < numCategories; i++) {
		let item = document.createElement("button");

		item.classList.add("class-item");
		item.textContent = data.categories[i];

		container.appendChild(item);
	}	
}

function init() {
	// show(false);
	populateCategories();
}

init();