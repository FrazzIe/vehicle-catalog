# OpenCatalogOptions

```ts
interface OpenCatalogOptions
{
	id: string,
	position: {
		x: number,
		y: number,
		z: number,
		heading: number
	},
	camera: {
		attach: {
			x: number,
			y: number,
			z: number,
			length?: boolean,
			breadth?: boolean
		},
		point: {
			x: number,
			y: number,
			z: number
		},
		update?: boolean
	}
}
```