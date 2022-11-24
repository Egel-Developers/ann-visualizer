import type { Neuron, Connection } from '$lib/models/ann';
import { numToGrayscale, numToRedGreen } from '$lib/scripts/numToColor';
import { activation } from '$lib/scripts/activation-function';
import type { Parameters } from '$lib/models/parameters';

export type DrawOptions = {
	neuronRadius: number;
	verSpace: number;

	horOffset: number;
	verOffset: number;
	totalWidth: number;
	totalHeight: number;
};

// NOTE: Draws single layer, with one output neuron
export function drawLayer(
	canvasEl: HTMLCanvasElement,
	parameters: Parameters,
	options: DrawOptions = {
		neuronRadius: 50,
		verSpace: 50,
		horOffset: 0,
		verOffset: 0,
		totalWidth: 0,
		totalHeight: 0
	}
) {
	try {
		// Run some checks
		if (!parameters) throw new Error('Must supply parameters');
		const { activations, weights, bias } = parameters;

		if (!canvasEl) return;
		if (!activations.length || !weights.length || bias == undefined)
			throw new Error('Must supply activations, weights and bias');
		if (activations.length !== weights.length)
			throw new Error('Must have the same number of activations and weights');

		// Get the canvas ready
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

		// Create the input neurons
		const inputNeurons = createInputNeurons(activations, options);

		// Create the output neuron
		const outputNeuron = createOutputNeuron(weights, activations, bias, options);

		// Create the connections
		const connections = createConnections(weights);

		// Draw the layer
		draw(inputNeurons, outputNeuron, connections, ctx);
	} catch (e) {
		if (e instanceof Error) console.error(e.message);
	}
}

export function calcDimensionsAndOffsets(
	activations: number[],
	canvasWidth: number,
	canvasHeight: number,
	neuronRadius: number,
	verSpace: number
): DrawOptions {
	const totalWidth = 800;
	const totalHeight = activations.length * neuronRadius * 2 + verSpace * (activations.length - 1);

	const horOffset = canvasWidth / 2 - totalWidth / 2;
	const verOffset = canvasHeight / 2 - totalHeight / 2;

	return {
		neuronRadius,
		verSpace,
		horOffset,
		verOffset,
		totalWidth,
		totalHeight
	};
}

function createInputNeurons(activations: number[], options: DrawOptions): Neuron[] {
	const inputNeurons: Neuron[] = [];

	const { neuronRadius, verSpace, horOffset, verOffset } = options;

	activations.forEach((activation, index) => {
		inputNeurons.push({
			activation,
			bias: 0,
			radius: neuronRadius,
			position: {
				x: horOffset + neuronRadius,
				y: verOffset + neuronRadius + index * 2 * neuronRadius + verSpace * index
			}
		});
	});

	return inputNeurons;
}

function createOutputNeuron(
	weights: number[],
	activations: number[],
	bias: number,
	options: DrawOptions
): Neuron {
	const { neuronRadius, horOffset, verOffset, totalWidth, totalHeight } = options;

	return {
		activation: activation(weights, activations, bias),
		bias,
		radius: neuronRadius,
		position: {
			x: horOffset - neuronRadius + totalWidth,
			y: verOffset + totalHeight / 2
		}
	};
}

function createConnections(weights: number[]): Connection[] {
	const connections: Connection[] = [];

	weights.forEach((weight, index) => {
		connections.push({
			weight,
			width: Math.abs(weights[index])
		});
	});

	return connections;
}

function draw(
	inputNeurons: Neuron[],
	outputNeuron: Neuron,
	connections: Connection[],
	ctx: CanvasRenderingContext2D
) {
	// Draw the connections
	inputNeurons.forEach((inputNeuron, index) => {
		ctx.beginPath();
		ctx.moveTo(inputNeuron.position.x, inputNeuron.position.y);
		ctx.lineTo(outputNeuron.position.x, outputNeuron.position.y);

		const { weight, width } = connections[index];

		if (weight) {
			ctx.strokeStyle = numToRedGreen(weight);
			ctx.lineWidth = width;
			ctx.setLineDash([0, 0]);
		} else {
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			ctx.setLineDash([15, 15]);
		}
		ctx.stroke();
	});

	// Reset line dash
	ctx.setLineDash([0, 0]);
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;

	// Draw the input neurons
	inputNeurons.forEach((inputNeuron) => {
		ctx.beginPath();
		ctx.arc(inputNeuron.position.x, inputNeuron.position.y, inputNeuron.radius, 0, 2 * Math.PI);
		ctx.fillStyle = numToGrayscale(inputNeuron.activation);
		ctx.fill();
		ctx.stroke();
	});

	// Draw the output neuron
	ctx.beginPath();
	ctx.arc(outputNeuron.position.x, outputNeuron.position.y, outputNeuron.radius, 0, 2 * Math.PI);
	ctx.fillStyle = numToGrayscale(outputNeuron.activation);
	ctx.fill();
	ctx.stroke();
}
