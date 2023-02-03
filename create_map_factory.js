export const create_map_factory = (implementation) => {
	return ({ m, s }) => {
		let map = (inp) => implementation({ m, s, l: map, inp });
		return map;
	};
};

export const createMapFactory = create_map_factory;
