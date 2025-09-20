function checkBag(bag: Uint8Array) {
	if (!(bag instanceof Uint8Array)) {
		throw new TypeError(bag + ' is not a Uint8Array');
	}
	if (7 != bag.length) {
		throw new RangeError('Bag must contain exactly 7 bytes');
	}
}

function compress(uncompressed: Uint8Array, bag: Uint8Array) {
	checkBag(bag);
	const uncompressedLength = uncompressed.length;
	// Allocate a compressed buffer for the worst-case scenario: none of the encountered bytes are in the bag.
	const compressed = new Uint8Array(uncompressedLength + 3 * Math.ceil(uncompressedLength / 8));
	// Build a table which maps bytes to codes (0..7).
	const codeFor = new Uint8Array(0x100);
	for (let code = 1; 8 != code; code++) {
		codeFor[bag[code - 1]] = code;
	}
	// Start the compression loop.
	var blockSize: number;
	var compressedPosition = 0;
	// Iterate over blocks of (up to) 8 uncompressed bytes.
	for (let uncompressedPosition = 0; uncompressedLength != uncompressedPosition; uncompressedPosition += blockSize) {
		blockSize = Math.min(8, uncompressedLength - uncompressedPosition);
		let tagPosition = compressedPosition;
		compressedPosition += 3;
		// Construct the 3-byte tag for this block and write the non-bag verbatim bytes.
		let tag = 0;
		for (let blockPosition = 0; blockSize != blockPosition; blockPosition++) {
			const byte = uncompressed[uncompressedPosition + blockPosition];
			const code = codeFor[byte];
			if (/* 0 != */ code) {
				tag |= code << (3 * blockPosition);
			} else /* if (0 == code) */ {
				compressed[compressedPosition++] = byte;
			}
		}
		// Write the tag (little endian).
		compressed[tagPosition   ++   ] = (tag /* >> 0 */)    & 0xFF;
		compressed[tagPosition   ++   ] = (tag    >> 8   )    & 0xFF;
		compressed[tagPosition/* ++ */] = (tag    >> 16  ) /* & 0xFF */;
	}
	// Trim the compressed buffer.
	return compressed.slice(0, compressedPosition);
}

function decompress(compressed: Uint8Array, bag: Uint8Array) {
	checkBag(bag);
	const compressedLength = compressed.length;
	// Allocate a decompressed buffer for the best-case scenario: every byte was in the bag.
	var decompressed = new Uint8Array(Math.floor(compressedLength / 3) * 8);
	// Start the decompression loop.
	var decompressedPosition = 0;
	for (let compressedPosition = 0; compressedLength != compressedPosition;) {
		// Read the 3-byte tag for this block (little endian).
		if (compressedPosition + 3 > compressedLength) {
			throw new Error('Unexpected end of input while reading tag');
		}
		const tag = (compressed[compressedPosition++] /* << 0 */)
		          | (compressed[compressedPosition++]    << 8   )
		          | (compressed[compressedPosition++]    << 16  );
		// Process the block.
		for (let blockPosition = 0; 8 != blockPosition; blockPosition++) {
			const code = (tag >> (3 * blockPosition)) & 0x7;
			let byte: number;
			if (/* 0 != */ code) {
				byte = bag[code - 1];
			} else /* if (0 == code) */ {
				if (compressedLength == compressedPosition) break;
				byte = compressed[compressedPosition++];
			}
			decompressed[decompressedPosition++] = byte
		}
	}
	// Trim the decompressed buffer.
	return decompressed.slice(0, decompressedPosition);
}