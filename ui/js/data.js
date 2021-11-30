let data = {};

async function loadData() {
	return await fetch(`../vehicles.json`, {
		method: "GET"
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		return [true, data]
	}).catch(function(error) {
		return [false, error];	
	});
}

let [loaded, result] = await loadData();

if (!loaded)
	console.log(`An error occured when loading vehicle data: ${result}`);
else
	data = result;

export { data }