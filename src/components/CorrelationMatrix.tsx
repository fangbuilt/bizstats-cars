// components/CorrelationMatrix.tsx
import { useMemo, useState } from "react";
import * as ss from "simple-statistics";
import type { Car } from "../utils/index";

const mpgOptions = ["City mpg", "Highway mpg"] as const;
const engineOptions = ["Torque", "Horsepower"] as const;

export function CorrelationMatrix({ data }: { data: Car[] }) {
	const [mpg, setMpg] = useState<(typeof mpgOptions)[number]>("City mpg");
	const [engine, setEngine] =
		useState<(typeof engineOptions)[number]>("Torque");

	const correlation = useMemo(() => {
		const mpgVals: number[] = [];
		const engineVals: number[] = [];

		for (const car of data) {
			const mpgVal = car["Fuel Information"][mpg];
			const engineVal = car["Engine Information"]["Engine Statistics"][engine];

			if (typeof mpgVal === "number" && typeof engineVal === "number") {
				mpgVals.push(mpgVal);
				engineVals.push(engineVal);
			}
		}

		return ss.sampleCorrelation(mpgVals, engineVals).toFixed(2);
	}, [data, mpg, engine]);

	return (
		<div className="w-full max-w-sm rounded bg-white p-4 shadow">
			<h3 className="mb-2 text-center text-xl font-semibold">Correlation</h3>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
				<select
					className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:w-auto"
					value={mpg}
					onChange={(e) =>
						setMpg(e.target.value as (typeof mpgOptions)[number])
					}
				>
					{mpgOptions.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<select
					className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:w-auto"
					value={engine}
					onChange={(e) =>
						setEngine(e.target.value as (typeof engineOptions)[number])
					}
				>
					{engineOptions.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<p className="text-lg font-semibold">{correlation}</p>
			</div>
		</div>
	);
}
