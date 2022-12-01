import SquashingFunction from '$lib/enums/SquashingFunction';

export default class Algorithms {
	// Calculate the activation of a neuron
	static activation(
		activations: number[],
		weights: number[],
		bias: number,
		squashingFunction: SquashingFunction
	) {
		// Calculate the weighted sum
		const sum = this.#weightedSum(weights, activations, bias);

		// Determine which squashing function to use
		if (squashingFunction === SquashingFunction.Sigmoid) {
			// Pass it through the sigmoid function and return it
			return this.#sigmoid(sum);
		} else if (squashingFunction === SquashingFunction.ReLU) {
			// Pass it through the ReLU function and return it
			return this.#relu(sum);
		}

		// If no squashing function was found, throw an error
		throw new Error(`Algorithms.activation: Squashing function not supported`);
	}

	// Calculate the weighted sum of the activations, weights and bias
	static #weightedSum(activations: number[], weights: number[], bias: number) {
		let sum = 0;

		// Multiply every activation with its corresponding weight and add it to the sum
		for (let i = 0; i < activations.length; i++) {
			sum += activations[i] * weights[i];
		}

		// Add the bias to the sum and return it
		return sum + bias;
	}

	// Squashes the input to a number between 0 and 1
	static #sigmoid(input: number) {
		return 1 / (1 + Math.pow(Math.E, -input));
	}

	// Squashes the input to a number between 0 and infinity
	static #relu(input: number) {
		return Math.max(0, input);
	}
}
