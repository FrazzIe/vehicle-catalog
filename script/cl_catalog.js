function onOpen() {
	SendNuiMessage(JSON.stringify({ type: "Show", payload: true }));
}

function onClose() {

}

function onSelectVehicle(data, cb) {

}

RegisterNuiCallbackType("selectVehicle");

on("__cfx_nui:selectVehicle", onSelectVehicle);