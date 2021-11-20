import { data } from "./data.js";

let app = document.getElementById("app");
let selectedCategory;

function show(val) {
	let show = val === true;
	if (show)
		app.style.display = "initial";
	else
		app.style.display = "none";
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

	for (let i = 1; i < numCategories; i++) {
		let item = document.createElement("button");

		item.classList.add("class-item");
		item.textContent = data.categories[i];
		item.dataset.idx = i;
		item.onclick = onCategoryClicked;

		container.appendChild(item);
	}
}

function init() {
	// show(false);
	populateCategories();
}

init();