import { data } from "./data.js";

let app = document.getElementById("app");

function show(val) {
	let show = val === true;
	if (show)
		app.style.display = "initial";
	else
		app.style.display = "none";
}

function init() {
	// show(false);
}

init();