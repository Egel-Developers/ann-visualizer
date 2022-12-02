import Algorithms from '$lib/models/Algorithms';
import type SquashingFunction from '$lib/enums/SquashingFunction';

class Neuron {
	activation = 0;
	bias: number;

	// Initialize the neuron with a bias
	constructor(bias = 0) {
		this.bias = bias;
	}
}

class Connection {
	weight: number;

	// Initialize the connection with a weight (default of 1)
	constructor(weight = 1) {
		this.weight = weight;
	}
}

export type NeuralNetworkState = {
	layers: Neuron[][];
	connections: Connection[][];
};

export default class NeuralNetwork {
	#layers: Neuron[][] = [];
	#connections: Connection[][] = [];
	#squashingFunction: SquashingFunction;

	// Initialize the neural network with a number of layers and neurons per layer
	// Also requires a squashing function to be used for the activation function
	constructor(layerSizes: number[], squashingFunction: SquashingFunction) {
		this.#squashingFunction = squashingFunction;

		this.#layers = this.#createLayers(layerSizes);

		this.#connections = this.#createConnections(this.#layers);
	}

	// Get the neural network in its current state
	getNeuralNetwork(): NeuralNetworkState {
		return {
			layers: this.#layers,
			connections: this.#connections
		};
	}

	// Set a specific weight for a connection
	setWeight(layerIndex: number, connectionIndex: number, weight: number) {
		// #region Error handling
		if (layerIndex < 0)
			throw new Error(
				`NeuralNetwork.setWeight: Layer index out of bounds. Provided index: ${layerIndex}, min index: 0`
			);
		if (layerIndex > this.#connections.length - 1)
			throw new Error(
				`NeuralNetwork.setWeight: Layer index out of bounds. Provided index: ${layerIndex}, max index: ${
					this.#connections.length - 1
				}`
			);
		if (connectionIndex > this.#connections[layerIndex].length - 1)
			throw new Error(
				`NeuralNetwork.setWeight: Connection index out of bounds. Provided index: ${connectionIndex}, max index: ${
					this.#connections[layerIndex].length - 1
				}, in layer: ${layerIndex}`
			);
		// #endregion

		this.#connections[layerIndex][connectionIndex].weight = weight;
	}

	// Set a specific bias for a neuron
	setBias(layerIndex: number, neuronIndex: number, bias: number) {
		// #region Error handling
		if (layerIndex < 0)
			throw new Error(
				`NeuralNetwork.setBias: Layer index out of bounds. Provided index: ${layerIndex}, min index: 0`
			);
		if (layerIndex > this.#layers.length - 1)
			throw new Error(
				`NeuralNetwork.setBias: Layer index out of bounds. Provided index: ${layerIndex}, max index: ${
					this.#layers.length - 1
				}`
			);
		if (neuronIndex > this.#layers[layerIndex].length - 1)
			throw new Error(
				`NeuralNetwork.setBias: Neuron index out of bounds. Provided index: ${neuronIndex}, max index: ${
					this.#layers[layerIndex].length - 1
				}, in layer: ${layerIndex}`
			);
		// #endregion

		this.#layers[layerIndex][neuronIndex].bias = bias;
	}

	// Set a specific activation for a neuron
	setActivation(layerIndex: number, neuronIndex: number, activation: number) {
		// #region Error handling
		if (layerIndex < 0)
			throw new Error(
				`NeuralNetwork.setActivation: Layer index out of bounds. Provided index: ${layerIndex}, min index: 0`
			);
		if (layerIndex > this.#layers.length - 1)
			throw new Error(
				`NeuralNetwork.setActivation: Layer index out of bounds. Provided index: ${layerIndex}, max index: ${
					this.#layers.length - 1
				}`
			);
		if (neuronIndex > this.#layers[layerIndex].length - 1)
			throw new Error(
				`NeuralNetwork.setActivation: Neuron index out of bounds. Provided index: ${neuronIndex}, max index: ${
					this.#layers[layerIndex].length - 1
				}, in layer: ${layerIndex}`
			);
		// #endregion

		this.#layers[layerIndex][neuronIndex].activation = activation;
	}

	// Set the input layer's activations
	setInputLayerActivations(activations: number[]) {
		// #region Error handling
		if (activations.length !== this.#layers[0].length)
			throw new Error(
				`NeuralNetwork.setInputLayerActivations: Number of activations does not match number of neurons in the input layer. Provided: ${
					activations.length
				}, expected: ${this.#layers[0].length}`
			);

		// #endregion

		// Loop over all the neurons in the input layer
		for (let i = 0; i < this.#layers[0].length; i++) {
			// Set the neuron's activation
			this.setActivation(0, i, activations[i]);
		}
	}

	// Runs the feed forward algorithm on the neural network and returns the output neurons's activations
	feedForward() {
		// Loop over all the layers (start at 1 to skip the input layer)
		for (let i = 1; i < this.#layers.length; i++) {
			// Loop over all the neurons in the current layer
			for (let j = 0; j < this.#layers[i].length; j++) {
				// Calculate the activation of the current neuron
				this.#layers[i][j].activation = this.#calcActivation(i, j);
			}
		}
	}

	// Calculate the activation of a neuron
	#calcActivation(layerIndex: number, neuronIndex: number) {
		// #region Error handling
		if (layerIndex < 0)
			throw new Error(
				`NeuralNetwork.#calcActivation: Layer index out of bounds. Provided index: ${layerIndex}, min index: 1`
			);
		if (layerIndex == 0)
			throw new Error(`NeuralNetwork.calcActivation: Cannot calculate activation for input layer`);
		if (layerIndex > this.#layers.length - 1)
			throw new Error(
				`NeuralNetwork.#calcActivation: Layer index out of bounds. Provided index: ${layerIndex}, max index: ${
					this.#layers.length - 1
				}`
			);
		if (neuronIndex > this.#layers[layerIndex].length - 1)
			throw new Error(
				`NeuralNetwork.#calcActivation: Neuron index out of bounds. Provided index: ${neuronIndex}, max index: ${
					this.#layers[layerIndex].length - 1
				}, in layer: ${layerIndex}`
			);
		// #endregion

		// Get all activations from the previous layer
		const prevLayerActivations = this.#layers[layerIndex - 1].map((neuron) => neuron.activation);

		// Get all weights from the connections from the previous layer to this neuron
		const weights = this.#connections[layerIndex - 1].map((connection) => connection.weight);

		// Get the bias of this neuron
		const bias = this.#layers[layerIndex][neuronIndex].bias;

		// Calculate the activation of this neuron and return it
		return Algorithms.activation(prevLayerActivations, weights, bias, this.#squashingFunction);
	}

	// Initialize the layers with neurons of the neural network
	#createLayers(layerSizes: number[]) {
		let layers: Neuron[][] = [];

		// Create as many layers as specified
		for (let i = 0; i < layerSizes.length; i++) {
			let layer: Neuron[] = [];

			// Fill each layer with neurons
			for (let j = 0; j < layerSizes[i]; j++) {
				layer = [...layer, new Neuron()];
			}

			// Append the layer to the layers array
			layers = [...layers, layer];
		}

		return layers;
	}

	// Initialize the connections between the layers of the neural network
	#createConnections(layers: Neuron[][]): Connection[][] {
		let connections: Connection[][] = [];

		// Loop over all layers except the last one
		for (let i = 0; i < layers.length - 1; i++) {
			let layerConnections: Connection[] = [];

			// Loop through all neurons in the current layer
			for (let j = 0; j < layers[i].length; j++) {
				// Loop through all neurons in the next layer
				for (let k = 0; k < layers[i + 1].length; k++) {
					// Add a connection between the current neuron and the next neuron
					layerConnections = [...layerConnections, new Connection()];
				}
			}

			// Append the layerConnections array to the connections array
			connections = [...connections, layerConnections];
		}

		return connections;
	}
}
