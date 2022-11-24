const weights = [4, 2, 6, 7, 0];
const activations = [0.99, 0.34, 0.66, 0.12, 0.09];
const bias = -5;

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

export function relu(input: number) {
	return Math.max(0, input);
}

const sum = weightedSum(weights, activations, bias);
const newActivation = relu(sum);

console.log(newActivation);
