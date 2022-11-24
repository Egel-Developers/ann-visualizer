import { writable } from 'svelte/store';
import type { Parameters } from '$lib/models/parameters';

export const inputParameters = writable<Parameters>({
	activations: [0, 0, 0, 0, 0],
	weights: [0, 0, 0, 0, 0],
	bias: 0
});

export const parameters = writable<Parameters>({
	activations: [0, 0, 0, 0, 0],
	weights: [0, 0, 0, 0, 0],
	bias: 0
});

export function setParameters(newParameters: Parameters) {
	parameters.set(newParameters);
}

export function formatAndSetParameters(newParameters: Parameters) {
	const formattedParameters = formatParameters(newParameters);

	console.log(formattedParameters);

	parameters.set(formattedParameters);
}

function formatParameters(newParameters: Parameters) {
	const { activations, weights, bias } = newParameters;

	const formattedActivations = activations.map((activation) => {
		return activation / 10;
	});

	return {
		activations: formattedActivations,
		weights,
		bias
	};
}
