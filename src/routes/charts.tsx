import { createFileRoute } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import { AvgMpgOverTime } from "../components/AvgMpgOvertime";
import { CorrelationMatrix } from "../components/CorrelationMatrix";
import { CARS, type Car, cleanData } from "../utils/index";

export const Route = createFileRoute("/charts")({
	component: RouteComponent,
});

type MetricOption = {
	key: string;
	title: string;
	getValue: (car: Car) => number | null;
};

const METRIC_OPTIONS: MetricOption[] = [
	{
		key: "cityMpg",
		title: "City MPG",
		getValue: (car) => car["Fuel Information"]["City mpg"],
	},
	{
		key: "highwayMpg",
		title: "Highway MPG",
		getValue: (car) => car["Fuel Information"]["Highway mpg"],
	},
	{
		key: "torque",
		title: "Torque (ft-lbs)",
		getValue: (car) => car["Engine Information"]["Engine Statistics"].Torque,
	},
	{
		key: "horsepower",
		title: "Horsepower",
		getValue: (car) =>
			car["Engine Information"]["Engine Statistics"].Horsepower,
	},
];

function RouteComponent() {
	return (
		<div className="min-h-screen flex flex-col gap-6 py-6 items-center justify-center bg-slate-100">
			<FuelEfficiencyRank />
			<AvgMpgOverTime data={cleanData} />
			<CorrelationMatrix data={cleanData} />
		</div>
	);
}

type FilterState = {
	driveline: string;
	transmission: string;
	selectedMetric: string;
};

function FuelEfficiencyRank() {
	const [filters, setFilters] = useState<FilterState>({
		driveline: "",
		transmission: "",
		selectedMetric: "cityMpg",
	});

	const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

	function toggleGroup(val: number) {
		setExpandedGroup((prev) => (prev === val ? null : val));
	}

	const drivelineId = useId();
	const transmissionId = useId();
	const metricId = useId();

	const { drivelineOptions, transmissionOptions } = useMemo(
		() => ({
			drivelineOptions: [
				...new Set(cleanData.map((car) => car["Engine Information"].Driveline)),
			],
			transmissionOptions: [
				...new Set(
					cleanData.map((car) => car["Engine Information"].Transmission),
				),
			],
		}),
		[],
	);

	const selectedMetricConfig = useMemo(
		() =>
			METRIC_OPTIONS.find((metric) => metric.key === filters.selectedMetric) ||
			METRIC_OPTIONS[0],
		[filters.selectedMetric],
	);

	const rankedCars = useMemo(() => {
		const filtered = cleanData.filter((car) => {
			if (
				filters.driveline &&
				car["Engine Information"].Driveline !== filters.driveline
			)
				return false;

			if (
				filters.transmission &&
				car["Engine Information"].Transmission !== filters.transmission
			)
				return false;

			return true;
		});

		const groups = new Map<number, Car[]>();

		for (const car of filtered) {
			const val = selectedMetricConfig.getValue(car);
			if (val == null) continue;

			if (!groups.has(val)) {
				groups.set(val, []);
			}
			groups.get(val)?.push(car);
		}

		const sortedGroups = [...groups.entries()]
			.sort((a, b) => b[0] - a[0]) // Descending value
			.slice(0, 10); // Top 10 metric *groups*

		return sortedGroups.map(([value, cars], index) => ({
			rank: index + 1,
			value,
			cars,
		}));
	}, [filters, selectedMetricConfig]);

	const updateFilters = (updates: Partial<FilterState>) => {
		setFilters((prev) => ({ ...prev, ...updates }));
	};

	return (
		<div className="w-full max-w-6xl px-4 pb-10 pt-6 bg-white shadow rounded">
			<h1 className="text-2xl font-bold mb-4">
				🚗 Top 10 Cars by {selectedMetricConfig.title}
			</h1>

			<div className="flex flex-wrap gap-4 mb-6">
				<div>
					<label
						htmlFor={metricId}
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Ranking Metric
					</label>
					<select
						id={metricId}
						className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						value={filters.selectedMetric}
						onChange={(e) => updateFilters({ selectedMetric: e.target.value })}
					>
						{METRIC_OPTIONS.map((metric) => (
							<option key={metric.key} value={metric.key}>
								{metric.title}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor={drivelineId}
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Driveline
					</label>
					<select
						id={drivelineId}
						className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						value={filters.driveline}
						onChange={(e) => updateFilters({ driveline: e.target.value })}
					>
						<option value="">All</option>
						{drivelineOptions.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor={transmissionId}
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Transmission
					</label>
					<select
						id={transmissionId}
						className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						value={filters.transmission}
						onChange={(e) => updateFilters({ transmission: e.target.value })}
					>
						<option value="">All</option>
						{transmissionOptions.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="overflow-x-auto rounded-md">
				<table className="min-w-full text-sm text-left">
					<thead className="bg-slate-200 text-gray-700 font-semibold">
						<tr>
							<th className="p-3">#</th>
							<th className="p-3">Model</th>
							<th className="p-3">{selectedMetricConfig.title}</th>
							<th className="p-3">Transmission</th>
							<th className="p-3">Driveline</th>
							<th className="p-3">Gears</th>
							<th className="p-3">Year</th>
							<th className="p-3">Size</th>
						</tr>
					</thead>
					<tbody>
						{rankedCars.map((group) => (
							<>
								<tr
									key={`group-${group.value}`}
									className="bg-slate-100 cursor-pointer hover:bg-slate-200"
									onClick={() => toggleGroup(group.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											toggleGroup(group.value);
										}
									}}
									tabIndex={0}
								>
									<td className="p-3 font-bold">{group.rank}</td>
									<td className="p-3 font-bold">{group.cars.length} cars</td>
									<td className="p-3 font-bold">{group.value}</td>
									<td className="p-3 font-bold">...</td>
									<td className="p-3 font-bold">...</td>
									<td className="p-3 font-bold">...</td>
									<td className="p-3 font-bold">...</td>
									<td className="p-3 font-bold">...</td>
								</tr>

								{expandedGroup === group.value &&
									group.cars.map((car, index) => {
										const size = `${car.Dimensions.Length}L × ${car.Dimensions.Width}W × ${car.Dimensions.Height}H`;

										return (
											<tr
												key={`${car.Identification.ID}-${car.Identification.Year}-${index}`}
												className="bg-white"
											>
												<td className="p-3" />
												<td className="p-3">{car.Identification.ID}</td>
												<td className="p-3">{group.value}</td>
												<td className="p-3">
													{car["Engine Information"].Transmission}
												</td>
												<td className="p-3">
													{car["Engine Information"].Driveline}
												</td>
												<td className="p-3">
													{car["Engine Information"]["Number of Forward Gears"]}
												</td>
												<td className="p-3">{car.Identification.Year}</td>
												<td className="p-3">{size}</td>
											</tr>
										);
									})}
							</>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
