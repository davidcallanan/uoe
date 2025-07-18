export const decode_bigint = (bytes) => {
	let bint = 0n;

	for (let i = 0; i < bytes.length; i++) {
		bint <<= 8n;
		bint += BigInt(bytes[i]);
	}

	return bint;
};

export const decodeBigint = decode_bigint;
