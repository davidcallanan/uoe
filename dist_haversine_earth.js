import { dist_haversine } from "./dist_haversine.js";

const EARTH_RADIUS_KM = 6371;

export const dist_haversine_earth = (location_a, location_b) => dist_haversine(location_a, location_b, EARTH_RADIUS_KM);

export const distHaversineEarth = dist_haversine_earth;
