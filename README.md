# vehicle-catalog

A vehicle catalog to be used with FiveM

A simple resource that can display a customisable list of vehicles through events

# Features
- Responsive user interface
- Gamepad support through Gamepad API
- Keyboard & Mouse support

- Registerable catalogs
- Multiple categories & vehicles
- Optional vehicle pricing
- Preview image support for vehicles

- Server-side event listener & callback for secure vehicle selection handling
- Vehicle statistics widget
- Configurable camera positioning relative to the displayed vehicle

# Events

## Client

### Open Catalog

- name: `vehicle-catalog:openCatalog`
- payload: [OpenCatalogOptions](./docs/OpenCatalogOptions.md)

#### Example (v8)

```js
emit("vehicle-catalog:openCatalog", {
	id: "catalog_id", // catalog id
	position: { // vehicle position
		x: 225.13,
		y: -992.03,
		z: -99.99,
		heading: 223.19
	},
	camera: { // camera offsets
		attach: { // ATTACH_CAM_TO_ENTITY offset
			x: -4.0,
			y: 4.5,
			z: 1.4,
			length: false, // adds the length of the model to the offset
			breadth: false // adds the breadth of the model to the offset
		},
		point: { // POINT_CAM_AT_ENTITY offset
			x: 0.1,
			y: 0.0,
			z: 0.0
		},
		update: false // use ATTACH_CAM_TO_ENTITY & POINT_CAM_AT_ENTITY on each vehicle
	}
});
```

## Server

### Register Catalog

- name: `vehicle-catalog:registerCatalog`
- payload: string, [CatalogOptions](./docs/CatalogOptions.md)

#### Example (node)

```js
emit("vehicle-catalog:registerCatalog", "catalog_id", {
	categories: [ // array of catagories
		"Compacts",
		"Coupes"
	],
	vehicles: [ // Array<Array<CatalogVehicle>>
		[
			{ model: "blista", price: 3000 }, // give a vehicle a price
			{ model: "brioso" },
			{ model: "dilettante" },
			{ model: "issi2" },
			{ model: "panto" },
			{ model: "prairie" },
			{ model: "rhapsody" },
			{ model: "issi3" }
		],
		[
			{ model: "cogcabrio" },
			{ model: "exemplar" },
			{ model: "f620" },
			{ model: "felon" },
			{ model: "felon2" },
			{ model: "jackal" },
			{ model: "oracle" },
			{ model: "oracle2" },
			{ model: "sentinel" },
			{ model: "sentinel2" },
			{ model: "windsor" },
			{ model: "windsor2" },
			{ model: "zion" },
			{ model: "zion2" }
		]
	]
});
```

# Event Listeners

## Server

### Select Vehicle

- name: `vehicle-catalog:selectVehicle`
- payload: string | number, string, string, number | undefined, function

#### Example (node)

```js
/**
 * Event listener that's triggered when a vehicle is selected
 * @param {string | number} src player id
 * @param {string} catalog catalog id
 * @param {string} model vehicle model
 * @param {number | undefined} [price] vehicle price
 * @param {function} callback tell the script to continue or close
 */
on("vehicle-catalog:selectVehicle", function(src, catalog, model, price, callback)
{
	// simple price check
	
	// if vehicle is free or not priced everything is ok
	if (!price)
	{
		callback(true); // tells the catalog to close
	}

	const playerMoney = 5000; // fake player money

	if (playerMoney >= price)
	{
		// we can buy
		callback(true); // tells the catalog to close
	}
	else
	{
		callback(false); // tells the catalog to stay open, but closes the loading screen
	}
});
```