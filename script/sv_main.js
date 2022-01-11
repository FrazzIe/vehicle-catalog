const data = require("./vehicles.json");
const { handler } = require("./script/sv_http.js")(data);
const resourceName = GetCurrentResourceName();

function onInit() {
	const src = global.source;
	emitNet(`${resourceName}:onInit`, src, GetConvar("web_baseUrl", ""));
}

SetHttpHandler(handler);
onNet(`${resourceName}:onInit`, onInit);