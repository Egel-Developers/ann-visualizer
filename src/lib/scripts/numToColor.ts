export function numToGrayscale(input: number) {
	if (input > 1 || input < 0) throw new Error('Number must be between 0 and 1');

	const flipped = Math.abs(1 - input);

	const hex = Math.round(flipped * 255).toString(16);
	return `#${hex}${hex}${hex}`;
}

export function numToRedGreen(input: number) {
	return input < 0 ? 'red' : 'lime';
}
