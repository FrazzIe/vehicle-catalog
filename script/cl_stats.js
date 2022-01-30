const numVehicleClasses = 22;
const vehicleClassStats = getClassStats();

/**
 * Get estimated max speed of a vehicle class
 * 
 * from fm_race_creator.c
 * 
 * @param {number} classId 
 * @returns {number} estimated max speed
 */
function getClassMaxSpeed(classId) 
{
	if (classId == 7)
	{
		return 51.77096;
	}
		
	return GetVehicleClassEstimatedMaxSpeed(classId);
}

/**
 * Get max traction of a vehicle class
 * 
 * from fm_race_creator.c
 * 
 * @param {number} classId 
 * @returns {number} max traction
 */
function getClassTraction(classId)
{
	if (classId == 14 || classId == 15 || classId == 16)
	{
		return GetVehicleClassMaxAgility(classId);
	}
		
	return GetVehicleClassMaxTraction(classId);
}

/**
 * Check if a vehicle model has reduced vehicle stats
 * 
 * from am_mp_arena_garage.c
 * 
 * @param {string} model vehicle model 
 * @returns {bool}
 */
function getModelHasReducedStats(model)
{
	switch(model)
	{
		case -512166165: // bmx
		case 448402357: // cruiser
		case -186537451: // scorcher
		case 1127861609: // tribike
		case -1233807380: // tribike2
		case -400295096: // tribike3
		case -836512833: // fixter
			return true;
		default:
			return false;
	}
}

/**
 * Get a collection of max vehicle stats for each vehicle class
 * @returns {object[][number]} collection of max vehicle stats for each vehicle class
 */
function getClassStats()
{
	const classStats = [];

	for (let i = 0; i < numVehicleClasses; i++)
	{
		classStats[i] = [];
		classStats[i][0] = getClassMaxSpeed(i);
		classStats[i][1] = GetVehicleClassMaxAcceleration(i);
		classStats[i][2] = GetVehicleClassMaxBraking(i);
		classStats[i][3] = getClassTraction(i);
	}

	return classStats;
}

/**
 * Get a vehicles stats
 * 
 * from am_mp_arena_garage.c
 * 
 * @param {object[][number]} classStats collection of max vehicle stats for each vehicle class (use getClassStats())
 * @param {number} vehicle vehicle handle
 * @returns {number[]} vehicle stats
 */
function getVehicleStats(classStats, vehicle)
{
	const vehicleClass = GetVehicleClass(vehicle);
	const vehicleModel = GetEntityModel(vehicle);

	if (classStats == null || classStats.length != numVehicleClasses)
	{
		return [false, "The vehicle class stats received were malformed"];
	}

	let offset = 1.0;

	if (getModelHasReducedStats(model))
	{
		offset = 0.5;
	}
		
	
	vehicleStats = [];
	vehicleStats[0] = GetVehicleEstimatedMaxSpeed(vehicle);
	vehicleStats[1] = GetVehicleAcceleration(vehicle) * offset;
	vehicleStats[2] = GetVehicleMaxBraking(vehicle) * offset;

	switch(model)
	{
		case -1622444098: // voltic
		{
			vehicleStats[1] *= 2.0;
			break;
		}
		case 1031562256: // tezeract
		{
			vehicleStats[1] *= 2.6753;
			break;
		}
		case -214906006: // jester3
		{
			vehicleStats[0] *= 0.9890084;
			break;
		}
		case -54332285: // freecrawler
		{
			vehicleStats[0] *= 0.9788762;
			break;
		}
		case 500482303: // swinger
		{
			vehicleStats[0] *= 0.9650553;
			break;
		}
		case 2044532910: // menacer
		{
			vehicleStats[0] *= 0.9730466;
			break;
		}
		case 219613597: // speedo4
		{
			vehicleStats[0] *= 0.9426523;
			break;
		}
	}
	
	if (IsThisModelAHeli(model) || IsThisModelAPlane(model))
	{
		vehicleStats[3] = GetVehicleModelMaxKnots(model) * offset;
	}		
	else if (IsThisModelABoat(model))
	{
		vehicleStats[3] = GetVehicleModelMoveResistance(model);
	}
	else
	{
		vehicleStats[3] = GetVehicleMaxTraction(vehicle) * offset;
	}		
	
	switch(model)
	{
		case 1663218586: // t20	
		{
			vehicleStats -= 0.05;
			break;
		}
		case -1353081087: // vindicator
		{
			vehicleStats -= 0.02;
			break;
		}
	}

	for (let i = 0; i < 4; i++) 
	{
		vehicleStats[i] = (vehicleStats[i] / classStats[_class][i]) * 100.0;

		if (vehicleStats[i] > 100.0)
		{
			vehicleStats[i] = 100.0;
		}
			
	}

	return [true, vehicleStats];
}