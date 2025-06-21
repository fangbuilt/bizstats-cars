import data from "../../src/cars.json";

export const CARS = data;

export type Car = (typeof CARS)[number];
