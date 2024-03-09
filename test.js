export const test = async (name, test) => {
	const result = await test();

	if (result === true) {
		console.log(`✅ ${name}`);
	} else {
		console.error(`❌ ${name}`);
	}
};
