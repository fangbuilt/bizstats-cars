import data from "../../src/cars.json";

export const CARS = data;

export type Car = (typeof CARS)[number];

interface OutlierConfig {
	iqrMultiplier?: number; // Default: 1.5 (standard), use 1.0 for stricter
}

function removeOutliers(
	data: Car[],
	config: OutlierConfig = { iqrMultiplier: 1.5 },
): Car[] {
	if (data.length === 0) return data;

	// Extract all numeric values with their paths
	const numericFields = [
		{
			path: "Dimensions.Height",
			extract: (item: Car) => item.Dimensions.Height,
		},
		{
			path: "Dimensions.Length",
			extract: (item: Car) => item.Dimensions.Length,
		},
		{ path: "Dimensions.Width", extract: (item: Car) => item.Dimensions.Width },
		{
			path: "Engine Information.Number of Forward Gears",
			extract: (item: Car) =>
				item["Engine Information"]["Number of Forward Gears"],
		},
		{
			path: "Engine Information.Engine Statistics.Horsepower",
			extract: (item: Car) =>
				item["Engine Information"]["Engine Statistics"].Horsepower,
		},
		{
			path: "Engine Information.Engine Statistics.Torque",
			extract: (item: Car) =>
				item["Engine Information"]["Engine Statistics"].Torque,
		},
		{
			path: "Fuel Information.City mpg",
			extract: (item: Car) => item["Fuel Information"]["City mpg"],
		},
		{
			path: "Fuel Information.Highway mpg",
			extract: (item: Car) => item["Fuel Information"]["Highway mpg"],
		},
		{
			path: "Identification.Year",
			extract: (item: Car) => item.Identification.Year,
		},
	];

	// Calculate outlier bounds for each field
	const fieldBounds = numericFields.map((field) => {
		const values = data
			.map(field.extract)
			.filter((v) => v != null)
			.sort((a, b) => a - b);

		if (values.length === 0)
			return {
				...field,
				lowerBound: Number.NEGATIVE_INFINITY,
				upperBound: Number.POSITIVE_INFINITY,
			};

		const q1Index = Math.floor(values.length * 0.25);
		const q3Index = Math.floor(values.length * 0.75);
		const q1 = values[q1Index];
		const q3 = values[q3Index];
		const iqr = q3 - q1;

		return {
			...field,
			lowerBound: q1 - (config.iqrMultiplier ?? 1.5) * iqr,
			upperBound: q3 + (config.iqrMultiplier ?? 1.5) * iqr,
		};
	});

	// Filter data - remove if ANY field is an outlier (strictest approach)
	return data.filter((item) => {
		return fieldBounds.every((field) => {
			const value = field.extract(item);
			return value >= field.lowerBound && value <= field.upperBound;
		});
	});
}

// Usage examples:
export const cleanData = removeOutliers(CARS, {
	iqrMultiplier: 1.0,
}); // Strictest: removes if ANY field is outlier

console.log("Cleaned data length:", cleanData.length);

const extraStrict = removeOutliers(CARS, {
	iqrMultiplier: 1.0,
}); // Even stricter bounds

const customStrict = removeOutliers(CARS, {
	iqrMultiplier: 0.8,
}); // Ultra-strict for highly curated datasets
