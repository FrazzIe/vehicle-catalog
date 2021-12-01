const data = require("./vehicles.json");
const { handler, onGenerateCmd, onGenerateEnd } = require("./script/sv_http.js")(data);
const resourceName = GetCurrentResourceName();

function onInit() {
	const src = global.source;
	emitNet(`${resourceName}:onInit`, src, GetConvar("web_baseUrl", ""));
}

SetHttpHandler(handler);
RegisterCommand("vc_gvi", onGenerateCmd);
RegisterCommand("vc_generate_vehicle_images", onGenerateCmd);
onNet(`${resourceName}:onGenerateEnd`, onGenerateEnd);
onNet(`${resourceName}:onInit`, onInit);