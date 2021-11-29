let categories = [];
let categoryElements;
let categoryIdx;
let onCategoryChanged;

function setCategories(data) {
	categories = data;
}

function onCategoryClicked(event) {
	let target = event.currentTarget;
	let idx = parseInt(target.dataset.idx);

	if (isNaN(idx))
		return;

	if (categories.length <= idx)
		return;

	if (categoryElements[categoryIdx])
		categoryElements[categoryIdx].classList.remove("selected");

	if (categoryElements[idx])
		categoryElements[idx].classList.add("selected");

	categoryIdx = idx;
	if (onCategoryChanged)
		onCategoryChanged(idx);
}

function changeCategory(increment) {
	let idx = (Math.abs(increment) % categories.length);

	if (increment < 0)
		idx = categoryIdx - idx;
	else
		idx = categoryIdx + idx;

	if (idx >= categories.length)
		idx -= categories.length;
	if (idx < 0)
		idx = categories.length + idx;

	if (categoryElements[categoryIdx])
		categoryElements[categoryIdx].classList.remove("selected");

	if (categoryElements[idx])
		categoryElements[idx].classList.add("selected");

	categoryIdx = idx;
	if (onCategoryChanged)
		onCategoryChanged(idx);
}

function populateCategories() {
	let container = document.querySelector(".category-container");
	let numCategories = categories.length;

	if (numCategories == 0)
		return;		

	categoryElements = [];
	categoryIdx = 0;

	for (let i = 0; i < numCategories; i++) {
		let item = document.createElement("button");

		item.classList.add("item");
		item.textContent = categories[i];
		item.dataset.idx = i;
		item.onclick = onCategoryClicked;
		
		container.appendChild(item);
		categoryElements.push(item);
	}

	categoryElements[categoryIdx].classList.add("selected");
	
	if (onCategoryChanged)
		onCategoryChanged(0);
}

function setOnCategoryChangedCallback(callback) {
	onCategoryChanged = callback;
}

function getSelectedCategoryElement() {
	return categoryElements[categoryIdx];
}

export { setCategories, changeCategory, populateCategories, setOnCategoryChangedCallback, getSelectedCategoryElement };