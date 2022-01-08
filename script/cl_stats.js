const vehicleClassCount = 22;
const vehicleStatLabels = [
	"FMMC_VEHST_0",
	"FMMC_VEHST_1",
	"FMMC_VEHST_2",
	"FMMC_VEHST_3"
];

/**
 * Get resolved vehicle stat labels
 * @returns {string[]} array of vehicle stat labels
 */
function getStatLabels() {
	const labels = [];

	for (let i = 0; i < vehicleStatLabels.length; i++) {
		labels[i] = GetLabelText(vehicleStatLabels[i]);
	}

	return labels;
}

// from fm_race_creator.c
function getClassMaxSpeed(classId) {
	if (classId == 7)
		return 51.77096;
	return GetVehicleClassEstimatedMaxSpeed(classId);
}

// from fm_race_creator.c
function getClassTraction(classId) {
	if (classId == 14 || classId == 15 || classId == 16)
		return GetVehicleClassMaxAgility(classId);
	return GetVehicleClassMaxTraction(classId);
}

// from am_mp_arena_garage.c
function getModelHasReducedStats(model) {
	switch(model) {
		case "bmx":
		case "cruiser":
		case "scorcher":
		case "tribike":
		case "tribike2":
		case "tribike3":
		case "fixter":
			return true;
		default:
			return false;
	}
}

// from fm_race_creator.c
function getClassStats() {
	let classStats = [];

	for (let i = 0; i < vehicleClassCount; i++) {
		classStats[i] = [];
		classStats[i][0] = getClassMaxSpeed(i);
		classStats[i][1] = GetVehicleClassMaxAcceleration(i);
		classStats[i][2] = GetVehicleClassMaxBraking(i);
		classStats[i][3] = getClassTraction(i);
	}

	return classStats;
}

// from am_mp_arena_garage.c
function getVehicleStats(classStats, vehicle, _model) {
	let _class = GetVehicleClass(vehicle);
	let model = _model;

	if (!model)
		model = GetEntityModel(vehicle);

	if (classStats == null || classStats.length != vehicleClassCount)
		return [false, "The vehicle class stats received were malformed"];

	let offset = 1.0;

	if (getModelHasReducedStats(model))
		offset = 0.5;
	
	vehicleStats = [];
	vehicleStats[0] = GetVehicleEstimatedMaxSpeed(vehicle);
	vehicleStats[1] = GetVehicleAcceleration(vehicle) * offset;
	vehicleStats[2] = GetVehicleMaxBraking(vehicle) * offset;

	switch(model) {
		case "voltic":
			vehicleStats[1] *= 2.0;
			break;
		case "tezeract":
			vehicleStats[1] *= 2.6753;
			break;
		case "jester3":
			vehicleStats[0] *= 0.9890084;
			break;
		case "freecrawler":
			vehicleStats[0] *= 0.9788762;
			break;
		case "swinger":
			vehicleStats[0] *= 0.9650553;
			break;
		case "menacer":
			vehicleStats[0] *= 0.9730466;
			break;
		case "speedo4":
			vehicleStats[0] *= 0.9426523;
			break;
	}
	
	if (IsThisModelAHeli(model) || IsThisModelAPlane(model))
		vehicleStats[3] = GetVehicleModelMaxKnots(model) * offset;
	else if (IsThisModelABoat(model))
		vehicleStats[3] = GetVehicleModelMoveResistance(model);
	else
		vehicleStats[3] = GetVehicleMaxTraction(vehicle) * offset;
	
	switch(model) {
		case "t20":
			vehicleStats -= 0.05;
			break;
		case "vindicator":
			vehicleStats -= 0.02;
			break;
	}

	for (let i = 0; i < 4; i++) {
		vehicleStats[i] = (vehicleStats[i] / classStats[_class][i]) * 100.0;
		if (vehicleStats[i] > 100.0)
			vehicleStats[i] = 100.0;
	}

	return [true, vehicleStats];
}