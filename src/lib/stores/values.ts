import { writable } from 'svelte/store';
import type { Neuron } from '$lib/models/NeuralNetwork';

export const inputValues = writable<Neuron[][]>();

export function fromNeuralNetwork(neuralNetworkValues: Neuron[][]) {
	inputValues.set(parseToInput(neuralNetworkValues));
}

function parseToInput(newValues: Neuron[][]): Neuron[][] {
	return newValues.map((layer) => {
		return layer.map((neuron) => {
			return {
				activation: neuron.activation * 10,
				bias: neuron.bias,
				connections: neuron.connections
			};
		});
	});
}

export function parseFromInput(newValues: Neuron[][]): Neuron[][] {
	return newValues.map((layer) => {
		return layer.map((neuron) => {
			return {
				activation: neuron.activation / 10,
				bias: neuron.bias,
				connections: neuron.connections
			};
		});
	});
}
