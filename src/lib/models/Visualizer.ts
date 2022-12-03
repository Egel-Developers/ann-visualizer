import DrawUtils from '$lib/models/DrawUtils';
import type { NeuralNetworkState } from '$lib/models/NeuralNetwork';
import type { Position } from '$lib/models/Positions';

type DrawOptions = {
	neuronRadius: number;

	horOffset: number;
	verOffset: number;
	totalWidth: number;
	totalHeight: number;
};

export default class Visualizer {
	#neuralNetwork: NeuralNetworkState;
	#canvas: HTMLCanvasElement;
	#ctx: CanvasRenderingContext2D;
	#drawOptions: DrawOptions = {
		neuronRadius: 0,
		horOffset: 0,
		verOffset: 0,
		totalWidth: 0,
		totalHeight: 0
	};
	#neuronPositions: Position[][] = [];

	// Initialize the visualizer with a canvas element and an optional neural network
	constructor(
		canvas: HTMLCanvasElement,
		neuralNetwork: NeuralNetworkState = { layers: [], connections: [] }
	) {
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
		// Calculate the dimensions and offsets
		this.#drawOptions = this.#calcDimensionsAndOffsets(this.#neuralNetwork, this.#canvas);

		// Calculate the positions of the neurons
		this.#neuronPositions = this.#calcNeuronPositions(this.#neuralNetwork);

		// Draw the connections
		// Loop over all the layers of neuron positions except the first
		for (let i = 1; i < this.#neuronPositions.length; i++) {
			// Loop over all the neurons in the layer
			for (let j = 0; j < this.#neuronPositions[i].length; j++) {
				// Loop over all the neurons in the previous layer
				for (let k = 0; k < this.#neuronPositions[i - 1].length; k++) {
					// Get the corresponding connection's weight
					const weight = this.#neuralNetwork.connections[i - 1][k][j].weight;

					// Draw the connection between the two neurons
					DrawUtils.drawConnection(
						this.#ctx,
						this.#neuronPositions[i - 1][k],
						this.#neuronPositions[i][j],
						Math.abs(weight),
						DrawUtils.numToRedGreen(weight)
					);
				}
			}
		}

		// Reset the line stroke styles
		DrawUtils.resetLineStroke(this.#ctx);

		// Draw the neurons
		// Loop over all the layers of neuron positions
		for (let i = 0; i < this.#neuronPositions.length; i++) {
			// Loop over all the neurons in the layer
			for (let j = 0; j < this.#neuronPositions[i].length; j++) {
				// Draw the neuron
				DrawUtils.drawNeuron(
					this.#ctx,
					this.#neuronPositions[i][j],
					this.#drawOptions.neuronRadius,
					DrawUtils.numToGrayscale(this.#neuralNetwork.layers[i][j].activation)
				);
			}
		}
	}

	#calcNeuronPositions(neuralNetwork: NeuralNetworkState) {
		let neuronPositions: Position[][] = [];

		// Loop over all layers in the neural network
		for (let i = 0; i < neuralNetwork.layers.length; i++) {
			let neuronPositionsLayer: Position[] = [];

			// Loop over all neurons in the layer
			for (let j = 0; j < neuralNetwork.layers[i].length; j++) {
				// Calculate the position of the neuron and add it to the array
				neuronPositionsLayer = [...neuronPositionsLayer, this.#calcNeuronPosition(i, j)];
			}

			// Add the layer of positions to the array
			neuronPositions = [...neuronPositions, neuronPositionsLayer];
		}

		return neuronPositions;
	}

	#calcNeuronPosition(layerIndex: number, neuronIndex: number): Position {
		// #region Error handling
		if (layerIndex < 0) throw new Error('Visualizer.#calcNeuronPosition: layerIndex must be >= 0');
		if (neuronIndex < 0)
			throw new Error('Visualizer.#calcNeuronPosition: neuronIndex must be >= 0');
		if (layerIndex >= this.#neuralNetwork.layers.length)
			throw new Error(
				`Visualizer.#calcNeuronPosition: layerIndex must be < ${this.#neuralNetwork.layers.length}`
			);
		if (neuronIndex >= this.#neuralNetwork.layers[layerIndex].length)
			throw new Error(
				`Visualizer.#calcNeuronPosition: neuronIndex must be < ${
					this.#neuralNetwork.layers[layerIndex].length
				}`
			);
		// #endregion

		// Get all the necessary values for the position calculations
		const { neuronRadius, horOffset, verOffset, totalHeight } = this.#drawOptions;
		const layerDistance = this.#calcLayerDistance(this.#neuralNetwork.layers.length);
		const layerSize = this.#neuralNetwork.layers[layerIndex].length;

		// Calculate the layer height and vertical offset
		const layerHeight = this.#calcLayerHeight(layerSize, neuronRadius);
		const layerVerOffset = totalHeight / 2 - layerHeight / 2;

		// Calculate the neuron position and return it
		return {
			x: neuronRadius + horOffset + layerIndex * (layerDistance + neuronRadius * 2),
			y: neuronRadius + verOffset + layerVerOffset + neuronIndex * neuronRadius * 3
		};
	}

	#calcDimensionsAndOffsets(
		neuralNetwork: NeuralNetworkState,
		canvas: HTMLCanvasElement
	): DrawOptions {
		// #region Error handling
		if (neuralNetwork.layers.length < 2)
			throw new Error(
				`Visualizer.#calcDimensionsAndOffsets: The neural network must have at least 2 layers, provided: ${neuralNetwork.layers.length}`
			);
		if (neuralNetwork.connections.length !== neuralNetwork.layers.length - 1)
			throw new Error(
				`Visualizer.#calcDimensionsAndOffsets: The neural network must have a layer of connections for each layer of neurons - 1. Provided: ${neuralNetwork.layers.length} layers of neurons and ${neuralNetwork.connections.length} layers of connections`
			);
		// #endregion

		// Get all the necessary values for the calcNeuronRadius method
		const layerCount = neuralNetwork.layers.length;
		const tallestLayerSize = Math.max(...neuralNetwork.layers.map((layer) => layer.length));

		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		// Calculate the layer distance
		const layerDistance = this.#calcLayerDistance(layerCount);

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

			horOffset,
			verOffset,
			totalWidth: totalWidth,
			totalHeight: totalHeight
		};
	}

	#calcLayerDistance(layerCount: number) {
		// #region Error handling
		if (layerCount < 2)
			throw new Error('Visualizer.#calcLayerDistance: The layer count must be at least 2');

		// #endregion

		return 800 / (layerCount - 1);
	}

	#calcLayerHeight(layerSize: number, neuronRadius: number) {
		return layerSize * neuronRadius * 2 + neuronRadius * (layerSize - 1);
	}

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
