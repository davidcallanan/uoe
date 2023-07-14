export const iter_arr_reverse = (arr) => {
	return {
		[Symbol.iterator]: () => {
			let idx = arr.length;

			return {
				next: () => {
					idx--;

					return {
						done: idx < 0,
						value: arr[idx],
					};
				},
			};
		},
	};
};

export const iterArrReverse = iter_arr_reverse;
