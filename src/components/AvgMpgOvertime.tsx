import type { ChartData } from "chart.js";
import { useMemo } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import * as ss from "simple-statistics";
import type { Car } from "../utils/index";

export function AvgMpgOverTime({ data }: { data: Car[] }) {
	const temporalData = useMemo(() => {
		const grouped: Record<number, { city: number[]; highway: number[] }> = {};

		for (const car of data) {
			const year = car.Identification.Year;
			const city = car["Fuel Information"]["City mpg"];
			const highway = car["Fuel Information"]["Highway mpg"];
			if (!grouped[year]) grouped[year] = { city: [], highway: [] };
			if (typeof city === "number") grouped[year].city.push(city);
			if (typeof highway === "number") grouped[year].highway.push(highway);
		}

		return Object.entries(grouped)
			.map(([yearStr, { city, highway }]) => {
				const year = Number.parseInt(yearStr);
				const avgCity = ss.mean(city);
				const avgHighway = ss.mean(highway);
				// Fix: Only calculate combined if both arrays have data
				const combinedValues =
					city.length > 0 && highway.length > 0
						? city
								.map((c, i) => (highway[i] ? (c + highway[i]) / 2 : c))
								.filter(Boolean)
						: [];
				const avgCombined =
					combinedValues.length > 0 ? ss.mean(combinedValues) : 0;

				return {
					year,
					city: avgCity,
					highway: avgHighway,
					combined: avgCombined,
				};
			})
			.sort((a, b) => a.year - b.year);
	}, [data]);

	const chartData: ChartData<"line"> = {
		labels: temporalData.map((d) => d.year.toString()),
		datasets: [
			{
				label: "City MPG",
				data: temporalData.map((d) => d.city),
				borderColor: "#3b82f6",
				backgroundColor: "#3b82f6",
				tension: 0.3,
			},
			{
				label: "Highway MPG",
				data: temporalData.map((d) => d.highway),
				borderColor: "#10b981",
				backgroundColor: "#10b981",
				tension: 0.3,
			},
			{
				label: "Avg MPG",
				data: temporalData.map((d) => d.combined),
				borderColor: "#f59e0b",
				backgroundColor: "#f59e0b",
				tension: 0.3,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: false,
				title: {
					display: true,
					text: "Miles Per Gallon",
				},
			},
			x: {
				title: {
					display: true,
					text: "Year",
				},
			},
		},
		plugins: {
			legend: {
				position: "top" as const,
			},
			tooltip: {
				mode: "index" as const,
				intersect: false,
			},
		},
	};

	return (
		<div className="w-full max-w-4xl rounded bg-white p-4 shadow">
			<h1 className="text-2xl font-bold mb-4">Average MPG Over Time</h1>
			<div className="h-80">
				<Line data={chartData} options={options} />
			</div>
		</div>
	);
}
