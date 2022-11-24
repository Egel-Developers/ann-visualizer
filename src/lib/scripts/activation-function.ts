export function activation(weights: number[], activations: number[], bias = 0) {
	const sum = weightedSum(weights, activations, bias);
	return sigmoid(sum);
}

export function weightedSum(weights: number[], activations: number[], bias: number) {
	let sum = 0;

	for (let i = 0; i < weights.length; i++) {
		sum += weights[i] * activations[i];
	}

	return sum + bias;
}

export function sigmoid(input: number) {
	return 1 / (1 + Math.pow(Math.E, -input));
}

// export function relu(input: number) {
// 	return Math.max(0, input);
// }
