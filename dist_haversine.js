/**
 * @stability 3 - stable
 * 
 * Calculates the distance between two lat/long locations on a sphere as the crow flies.
 * 
 * This function was adapted from https://stackoverflow.com/q/18883601/1541397
 */

export const dist_haversine = (location_a, location_b, sphere_radius = 1) => {
	const degrees_to_radians = Math.PI / 180;

	let lat_a = location_a.latitude * degrees_to_radians;
	let lon_a = location_a.longitude * degrees_to_radians;
	let lat_b = location_b.latitude * degrees_to_radians;
	let lon_b = location_b.longitude * degrees_to_radians;

	let dist_lat = lat_b - lat_a;
	let dist_lon = lon_b - lon_a;

	let a = Math.pow(Math.sin(dist_lat / 2), 2) + Math.cos(lat_a) * Math.cos(lat_b) * Math.pow(Math.sin(dist_lon / 2), 2);
	let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
	
	return c * sphere_radius;
};

export const distHaversine = dist_haversine;
