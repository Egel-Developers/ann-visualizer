import DrawUtils from '$lib/models/DrawUtils';
import type { Position } from '$lib/models/Position';
import type { Neuron } from '$lib/models/NeuralNetwork';

type DrawOptions = {
	neuronRadius: number;
	layerDistance: number;

	horOffset: number;
	verOffset: number;
	totalWidth: number;
	totalHeight: number;
};

export default class Visualizer {
	#neuralNetwork: Neuron[][];
	#canvas: HTMLCanvasElement;
	#ctx: CanvasRenderingContext2D;
	#drawOptions: DrawOptions = {
		neuronRadius: 0,
		layerDistance: 0,
		horOffset: 0,
		verOffset: 0,
		totalWidth: 0,
		totalHeight: 0
	};
	#neuronPositions: Position[][] = [];

	// Initialize the visualizer with a canvas element and an optional neural network
	constructor(canvas: HTMLCanvasElement, neuralNetwork: Neuron[][] = []) {
		// #region Error handling
		if (!canvas) throw new Error('Visualizer.constructor: No (valid) canvas provided');
		// #endregion

		this.#canvas = canvas;
		this.#neuralNetwork = neuralNetwork;

		// Get the CanvasRenderingContext2D
		const ctx = this.#canvas.getContext('2d');
		if (!ctx) throw new Error('Visualizer.constructor: Could not get canvas context');
		this.#ctx = ctx;

		// Clear the canvas
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
	}

	// Draw the neural network
	draw() {
		console.log('Drawing!');

		// Clear the canvas
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

		// Calculate the dimensions and offsets
		this.#drawOptions = this.#calcDimensionsAndOffsets(this.#neuralNetwork, this.#canvas);

		// Calculate the positions of the neurons
		this.#neuronPositions = this.#calcNeuronPositions(this.#neuralNetwork);

		// Get the right values for the drawing
		const neuralNetwork = this.#neuralNetwork;
		const neuronPositions = this.#neuronPositions;
		const drawOptions = this.#drawOptions;
		const ctx = this.#ctx;

		// Draw all connections
		// Loop over all layers of neurons except the first one
		for (let n = 1; n < neuralNetwork.length; n++) {
			const currentLayer = neuralNetwork[n];
			const prevLayer = neuralNetwork[n - 1];

			// Loop over all neurons in the current layer
			for (let j = 0; j < currentLayer.length; j++) {
				// Loop over all neurons in the previous layer
				for (let k = 0; k < prevLayer.length; k++) {
					// Get the connection's weight
					const weight = currentLayer[j].connections[k].weight;

					// Draw the connection between the current and previous neuron
					DrawUtils.drawConnection(
						ctx,
						neuronPositions[n - 1][k],
						neuronPositions[n][j],
						Math.abs(weight),
						weight ? DrawUtils.numToRedGreen(weight) : undefined
					);
				}
			}
		}

		// Reset the line stroke styles
		DrawUtils.resetLineStroke(ctx);

		// Draw all neurons
		// Loop over all layers of neurons
		for (let n = 0; n < neuralNetwork.length; n++) {
			const currentLayer = neuralNetwork[n];

			// Loop over the neurons in the current layer
			for (let j = 0; j < currentLayer.length; j++) {
				// Draw the neuron
				DrawUtils.drawNeuron(
					ctx,
					neuronPositions[n][j],
					drawOptions.neuronRadius,
					DrawUtils.numToGrayscale(neuralNetwork[n][j].activation)
				);
			}
		}
	}

	// Updates the neural network used for drawing
	updateNeuralNetwork(neuralNetwork: Neuron[][]) {
		this.#neuralNetwork = neuralNetwork;
	}

	// Calculate all neuron x and y positions on the canvas in pixels
	#calcNeuronPositions(neuralNetwork: Neuron[][]) {
		const { neuronRadius, totalHeight } = this.#drawOptions;

		let neuronPositions: Position[][] = [];

		// Loop over all layers in the neural network
		for (let n = 0; n < neuralNetwork.length; n++) {
			let neuronPositionsLayer: Position[] = [];

			// Calculate the layer height and vertical offset
			const layerHeight = this.#calcLayerHeight(neuralNetwork[n].length, neuronRadius);
			const layerVerOffset = totalHeight / 2 - layerHeight / 2;

			// Loop over all neurons in the layer
			for (let j = 0; j < neuralNetwork[n].length; j++) {
				// Calculate the position of the neuron and add it to the array
				neuronPositionsLayer = [
					...neuronPositionsLayer,
					this.#calcNeuronPosition(n, j, layerVerOffset)
				];
			}

			// Add the layer of positions to the array
			neuronPositions = [...neuronPositions, neuronPositionsLayer];
		}

		return neuronPositions;
	}

	// Calculate the x and y position on the canvas in pixels of a single neuron (center of the neuron)
	#calcNeuronPosition(layerIndex: number, neuronIndex: number, layerVerOffset: number): Position {
		// #region Error handling
		if (layerIndex < 0) throw new Error('Visualizer.#calcNeuronPosition: layerIndex must be >= 0');
		if (neuronIndex < 0)
			throw new Error('Visualizer.#calcNeuronPosition: neuronIndex must be >= 0');
		if (layerIndex >= this.#neuralNetwork.length)
			throw new Error(
				`Visualizer.#calcNeuronPosition: layerIndex must be < ${this.#neuralNetwork.length}`
			);
		if (neuronIndex >= this.#neuralNetwork[layerIndex].length)
			throw new Error(
				`Visualizer.#calcNeuronPosition: neuronIndex must be < ${
					this.#neuralNetwork[layerIndex].length
				}`
			);
		// #endregion

		// Get all the necessary values for the position calculations
		const { neuronRadius, layerDistance, horOffset, verOffset } = this.#drawOptions;

		// Calculate the neuron position and return it
		return {
			x: neuronRadius + horOffset + layerIndex * (layerDistance + neuronRadius * 2),
			y: neuronRadius + verOffset + layerVerOffset + neuronIndex * neuronRadius * 3
		};
	}

	// Calculate all the necessary dimensions and offsets used for drawing the neural network
	#calcDimensionsAndOffsets(neuralNetwork: Neuron[][], canvas: HTMLCanvasElement): DrawOptions {
		// #region Error handling
		if (neuralNetwork.length < 2)
			throw new Error(
				`Visualizer.#calcDimensionsAndOffsets: The neural network must have at least 2 layers, provided: ${neuralNetwork.length}`
			);
		// #endregion

		// Get all the necessary values for the calcNeuronRadius method
		const layerCount = neuralNetwork.length;
		const tallestLayerSize = Math.max(...neuralNetwork.map((layer) => layer.length));

		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		// Calculate the layer distance
		const layerDistance = this.#calcLayerDistance(canvasWidth, layerCount);

		// Calculate the neuron radius based on the number of layers, the size of the tallest layer and the canvas size
		const radius = this.#calcNeuronRadius(layerDistance, tallestLayerSize, canvasHeight);

		// Calculate the total width and height of the neural network on the canvas
		const totalWidth = layerDistance * (layerCount - 1) + radius * layerCount * 2;
		const totalHeight = this.#calcLayerHeight(tallestLayerSize, radius);

		// Calculate the horizontal and vertical offset, used to center the neural network on the canvas
		const horOffset = (canvasWidth - totalWidth) / 2;
		const verOffset = (canvasHeight - totalHeight) / 2;

		return {
			neuronRadius: radius,
			layerDistance,

			horOffset,
			verOffset,
			totalWidth: totalWidth,
			totalHeight: totalHeight
		};
	}

	// Calculate the horizontal distance between the layers in pixels, based on the width of the canvas and the number of layers
	#calcLayerDistance(canvasWidth: number, layerCount: number) {
		// #region Error handling
		if (layerCount < 2)
			throw new Error('Visualizer.#calcLayerDistance: The layer count must be at least 2');

		// #endregion

		return canvasWidth / 2 / (layerCount - 1);
	}

	// Calculate the height of a layer in pixels, based on the number of neurons in the layer and the radius of the neurons
	#calcLayerHeight(layerSize: number, neuronRadius: number) {
		return layerSize * neuronRadius * 2 + neuronRadius * (layerSize - 1);
	}

	// Calculate the radius of the neurons in pixels, based on the number of layers, the size of the tallest layer and the canvas height
	#calcNeuronRadius(layerDistance: number, tallestLayer: number, canvasHeight: number) {
		// #region Error handling
		if (tallestLayer < 1)
			throw new Error(
				'Visualizer.#calcNeuronRadius: The tallest layer must have at least 1 neuron'
			);

		// #endregion

		// Calculate the radius of the neurons, based on the size of the tallest layer
		let radius = Math.min(canvasHeight / (tallestLayer * 3 + 1), 100);

		// Set the radius to 1/4 of the layerDistance if it's too big
		if (radius > layerDistance / 4) {
			radius = layerDistance / 4;
		}

		return radius;
	}
}
