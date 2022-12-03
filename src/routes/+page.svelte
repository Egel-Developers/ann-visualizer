<script lang="ts">
	import SquashingFunction from '$lib/enums/SquashingFunction';
	import NeuralNetwork from '$lib/models/NeuralNetwork';
	import Visualizer from '$lib/models/Visualizer';

	import { inputValues, fromNeuralNetwork, parseFromInput } from '$lib/stores/values';
	import getRandomInt from '$lib/scripts/getRandomInt';

	import { onMount } from 'svelte';

	// Update the neural network state, whenever any of the input values change
	$: $inputValues, update();

	let canvasEl: HTMLCanvasElement;
	let VIS: Visualizer;

	// Instantiate the default neural network
	let ANN = new NeuralNetwork([2, 4, 1], SquashingFunction.Sigmoid);
	ANN.feedForward();

	// Initialize all the input values, based on the default neural network state
	fromNeuralNetwork(ANN.getNeuralNetwork());

	// Get the initial layerCount and layerSizes, to use in the input fields as default values
	let layerCount = ANN.getNeuralNetwork().length;
	let layerSizes = ANN.getNeuralNetwork().map((layer) => layer.length);

	// Update the neural network state, based on the input values
	function update() {
		if (!VIS) return;
		ANN.updateNeuralNetwork(parseFromInput($inputValues));
		ANN.feedForward();

		// Redraw the neural network
		VIS.updateNeuralNetwork(ANN.getNeuralNetwork());
		VIS.draw();
	}

	// Update the neural network structure
	function updateStructure() {
		if (layerCount < layerSizes.length) layerSizes = layerSizes.slice(0, layerCount);
		else if (layerCount > layerSizes.length) {
			for (let i = layerSizes.length; i < layerCount; i++) {
				layerSizes = [...layerSizes, 1];
			}
		}

		ANN = new NeuralNetwork(layerSizes, SquashingFunction.Sigmoid);
		ANN.feedForward();

		// Initialize all the input values, based on the neural network state
		fromNeuralNetwork(ANN.getNeuralNetwork());

		// Redraw the neural network
		VIS.updateNeuralNetwork(ANN.getNeuralNetwork());
		VIS.draw();
	}

	// Randomize the neural network
	function randomize() {
		// Randomize the neural network structure
		layerSizes = [];
		layerCount = getRandomInt(6) + 2;

		for (let n = 0; n < layerCount; n++) {
			layerSizes = [...layerSizes, getRandomInt(6) + 2];
		}

		console.log(layerSizes);

		ANN = new NeuralNetwork(layerSizes, SquashingFunction.Sigmoid);
		ANN.feedForward();

		// Initialize all the input values, based on the neural network state
		fromNeuralNetwork(ANN.getNeuralNetwork());

		// Randomize the input activations
		for (let j = 0; j < layerSizes[0]; j++) {
			$inputValues[0][j].activation = getRandomInt(10);
		}

		// Randomize the biases
		for (let n = 0; n < layerSizes.length; n++) {
			for (let j = 0; j < layerSizes[n]; j++) {
				$inputValues[n][j].bias = getRandomInt(20) - 10;
			}
		}

		// Randomize the weights
		// The first layer doesn't have connections
		for (let n = 1; n < layerSizes.length; n++) {
			// Loop over all neurons in the nth layer
			for (let j = 0; j < layerSizes[n]; j++) {
				// Loop over all neurons in the (n-1)th layer
				for (let k = 0; k < layerSizes[n - 1]; k++) {
					$inputValues[n][j].connections[k].weight = getRandomInt(20) - 10;
				}
			}
		}

		ANN = new NeuralNetwork(layerSizes, SquashingFunction.Sigmoid);
		update();
	}

	onMount(() => {
		draw();
		window.addEventListener('resize', draw);
	});

	// (Re)draws the neural network
	function draw() {
		try {
			if (!canvasEl) return;

			canvasEl.width = window.innerWidth * 0.8;
			canvasEl.height = window.innerHeight;

			VIS = new Visualizer(canvasEl, ANN.getNeuralNetwork());
			VIS.draw();
		} catch (e) {
			console.log(e);
		}
	}
</script>

<div class="flex">
	<div class="flex flex-col w-1/5 bg-blue-400 h-screen">
		<button class="bg-blue-500 font-semibold p-2" on:click={randomize}>Randomize</button>
		<form class="flex flex-col gap-8 p-8 overflow-y-auto">
			<section>
				<h2 class="text-xl font-semibold mb-2">Structuur</h2>
				<div class="flex gap-4 justify-between">
					<label class="" for="nodeCount">Aantal lagen</label>
					<input
						class="w-28 pl-2 mb-1 rounded-sm outline-none border-2 border-transparent focus:border-gray-400 transition"
						type="number"
						name="nodeCount"
						min="2"
						bind:value={layerCount}
						on:input={updateStructure}
					/>
				</div>
				{#each Array(layerCount) as _, i}
					<div class="flex gap-4 justify-between">
						<label class="" for="nodeCount">Neuronen in laag {i}</label>
						<input
							class="w-28 pl-2 mb-1 rounded-sm outline-none border-2 border-transparent focus:border-gray-400 transition"
							type="number"
							name="nodeCount"
							min="1"
							bind:value={layerSizes[i]}
							on:input={updateStructure}
						/>
					</div>
				{/each}
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-2">Activations</h2>
				{#each $inputValues[0] as _, j}
					<div class="flex gap-2 justify-between">
						<label class="w-28" for={`activation-0,${j}`}
							><i>a<sub>0,{j}</sub></i> = {$inputValues[0][j].activation / 10}</label
						>
						<input
							class="w-full"
							type="range"
							min="0"
							max="10"
							name={`activation-0,${j}`}
							bind:value={$inputValues[0][j].activation}
						/>
					</div>
				{/each}
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-2">Biases</h2>
				{#each $inputValues as _, n}
					{#if n > 0}
						{#each $inputValues[n] as _, j}
							<div class="flex gap-4 justify-between">
								<label class="w-28" for={`bias-${n},${j}`}
									><i>b<sub>{n},{j}</sub></i> = {$inputValues[n][j].bias}</label
								>
								<input
									class="w-full"
									type="range"
									min="-10"
									max="10"
									name={`bias-${n},${j}`}
									bind:value={$inputValues[n][j].bias}
								/>
							</div>
						{/each}
					{/if}
				{/each}
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-2">Weights</h2>
				{#each $inputValues as _, n}
					{#each $inputValues[n] as _, j}
						{#each $inputValues[n][j].connections as _, k}
							<div class="flex gap-2 justify-between">
								<label class="w-28" for={`weight-${n},${j},${k}`}
									><i>w<sub>{n},{j},{k}</sub></i> = {$inputValues[n][j].connections[k]
										.weight}</label
								>
								<input
									class="w-full"
									type="range"
									min="-10"
									max="10"
									name={`weight-${n},${j},${k}`}
									bind:value={$inputValues[n][j].connections[k].weight}
								/>
							</div>
						{/each}
					{/each}
				{/each}
			</section>
		</form>

		<article class="flex flex-col gap-2 mt-auto px-8 py-4 bg-blue-500">
			<h2 class="text-xl font-semibold">Legenda</h2>
			<div class="flex items-center gap-4">
				<span class="rounded-full h-4 w-4 bg-black" />
				Minimale activation
			</div>
			<div class="flex items-center gap-4">
				<span class="rounded-full h-4 w-4 bg-white" />
				Maximale activation
			</div>
			<div class="flex items-center gap-4">
				<span class="h-1 w-4 bg-red-500" />
				Negatieve weight
			</div>
			<div class="flex items-center gap-4">
				<span class="h-1 w-4 bg-lime-500" />
				Positieve weight
			</div>
			<div class="flex items-center gap-4">
				<span class="w-4 border-t-2 border-dashed border-black" />
				Geen weight
			</div>
		</article>
	</div>
	<canvas bind:this={canvasEl} />
</div>

<style>
	canvas {
		height: 100vh;
		width: 80vw;
	}
</style>
