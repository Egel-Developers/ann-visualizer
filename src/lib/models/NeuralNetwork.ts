import Algorithms from '$lib/models/Algorithms';
import type SquashingFunction from '$lib/enums/SquashingFunction';

class Connection {
	weight: number;

	// Initialize the connection with a weight (default of 1)
	constructor(weight = 1) {
		this.weight = weight;
	}
}

export class Neuron {
	activation = 0;
	bias: number;
	connections: Connection[] = [];

	// Initialize the neuron with connections and a bias
	constructor(connections: Connection[], bias = 0) {
		this.connections = connections;
		this.bias = bias;
	}
}

export default class NeuralNetwork {
	#layers: Neuron[][] = [];
	#squashingFunction: SquashingFunction;

	// Initialize the neural network with a number of layers and neurons per layer
	// Also requires a squashing function to be used for the activation function
	constructor(layerSizes: number[], squashingFunction: SquashingFunction) {
		this.#squashingFunction = squashingFunction;

		this.#layers = this.#createLayers(layerSizes);
	}

	// Get the neural network in its current state
	getNeuralNetwork() {
		return this.#layers;
	}

	// Update the neural network
	updateNeuralNetwork(neuralNetwork: Neuron[][]) {
		this.#layers = neuralNetwork;
	}

	// Set a specific weight for a connection
	setWeight(layerIndex: number, neuronIndex: number, connectionIndex: number, weight: number) {
		// #region Error handling
		if (layerIndex < 1)
			throw new Error(
				`NeuralNetwork.setWeight: Layer index out of bounds. Provided index: ${layerIndex}, min index: 1`
			);
		if (layerIndex > this.#layers.length - 1)
			throw new Error(
				`NeuralNetwork.setWeight: Layer index out of bounds. Provided index: ${layerIndex}, max index: ${
					this.#layers.length - 1
				}`
			);
		if (neuronIndex > this.#layers[layerIndex].length - 1)
			throw new Error(
				`NeuralNetwork.setWeight: Neuron index out of bounds. Provided index: ${neuronIndex}, max index: ${
					this.#layers[layerIndex].length - 1
				}, in layer: ${layerIndex}`
			);
		if (connectionIndex > this.#layers[layerIndex][neuronIndex].connections.length - 1)
			throw new Error(
				`NeuralNetwork.setWeight: Connection index out of bounds. Provided index: ${connectionIndex}, max index: ${
					this.#layers[layerIndex][neuronIndex].connections.length - 1
				}, in layer: ${layerIndex}, for neuron: ${neuronIndex}`
			);
		// #endregion

		this.#layers[layerIndex][neuronIndex].connections[connectionIndex].weight = weight;
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
		for (let n = 1; n < this.#layers.length; n++) {
			// Loop over all the neurons in the current layer
			for (let j = 0; j < this.#layers[n].length; j++) {
				// Calculate the activation of the current neuron
				this.#layers[n][j].activation = this.#calcActivation(n, j);
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

		// Get the neuron
		const neuron = this.#layers[layerIndex][neuronIndex];

		// Get all weights from the connections from the previous layer to this neuron
		const weights = neuron.connections.map((connection) => connection.weight);

		// Get the bias of this neuron
		const bias = neuron.bias;

		// Calculate the activation of this neuron and return it
		return Algorithms.activation(prevLayerActivations, weights, bias, this.#squashingFunction);
	}

	// Initialize the layers with neurons and their connections of the neural network
	#createLayers(layerSizes: number[]) {
		let layers: Neuron[][] = [];

		// Create as many layers as specified
		for (let n = 0; n < layerSizes.length; n++) {
			let layer: Neuron[] = [];

			// Fill each layer with neurons
			for (let j = 0; j < layerSizes[n]; j++) {
				let connections: Connection[] = [];

				if (n > 0) connections = Array.from({ length: layerSizes[n - 1] }, (_) => new Connection());

				layer = [...layer, new Neuron(connections)];
			}

			// Append the layer to the layers array
			layers = [...layers, layer];
		}

		return layers;
	}
}
