<script lang="ts">
	import { onMount } from 'svelte';
	import { drawLayer } from '$lib/scripts/drawLayer';
	import { calcDimensionsAndOffsets } from '$lib/scripts/drawLayer';
	import type { DrawOptions } from '$lib/scripts/drawLayer';
	import {
		formatAndSetParameters,
		inputParameters,
		parameters,
		setParameters
	} from '$lib/stores/parameters';

	let nodeCount: number = 5;
	let options: DrawOptions;

	let canvasWidth: number;
	let canvasHeight: number;

	setParameters({
		activations: new Array(5).fill(0),
		weights: new Array(5).fill(0),
		bias: 5
	});

	$: {
		if ($inputParameters) {
			console.log($inputParameters);

			formatAndSetParameters($inputParameters);

			drawLayer(canvasEl, $parameters, options);

			redrawCanvas();
		}
	}

	// Canvas code
	let canvasEl: HTMLCanvasElement;

	function redrawCanvas() {
		if (!canvasEl) return;

		// Calculate all the relevant dimensions and offsets for the canvas
		options = calcDimensionsAndOffsets($parameters.activations.length, canvasWidth, canvasHeight);

		// Draw the ANN layer
		drawLayer(canvasEl, $parameters, options);
	}

	function updateParameters() {
		nodeCount = Math.max(1, nodeCount);

		$inputParameters.activations = $inputParameters.activations.slice(0, nodeCount - 1);
		$inputParameters.weights = $inputParameters.weights.slice(0, nodeCount - 1);

		for (let i = 0; i < nodeCount; i++) {
			if (!$inputParameters.activations[i]) {
				$inputParameters.activations[i] = 0;
			}
			if (!$inputParameters.weights[i]) {
				$inputParameters.weights[i] = 0;
			}
		}
	}

	onMount(() => {
		redrawCanvas();

		canvasWidth = window.innerWidth * 0.8;
		canvasHeight = window.innerHeight;

		canvasEl.width = canvasWidth;
		canvasEl.height = canvasHeight;

		window.addEventListener('resize', redrawCanvas);
	});
</script>

<div class="flex">
	<div class="w-1/5 bg-blue-400 overflow-y-auto h-screen">
		<form class="flex flex-col gap-8 p-12">
			<section>
				<h2 class="text-xl font-semibold">Neuronen</h2>
				<div class="flex gap-4 justify-between">
					<label class="" for="nodeCount">Aantal input neuronen</label>
					<input
						class="w-24 pl-2 rounded-sm outline-none border-2 border-transparent focus:border-gray-400 transition"
						type="number"
						name="nodeCount"
						min="1"
						bind:value={nodeCount}
						on:input={updateParameters}
					/>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold">Biases</h2>
				<div class="flex gap-4 justify-between">
					<label class="w-24" for="bias"><i>b</i> = {$parameters.bias}</label>
					<input
						class="w-full"
						type="range"
						min="-10"
						max="10"
						name="bias"
						bind:value={$inputParameters.bias}
					/>
				</div>
			</section>

			<section>
				<h2 class="text-xl font-semibold">Activations</h2>
				{#each Array(nodeCount) as _, i}
					<div class="flex gap-2 justify-between">
						<label class="w-24" for={`activation-${i}`}
							><i>a<sub>{i}</sub></i> = {$parameters.activations[i]}</label
						>
						<input
							class="w-full"
							type="range"
							min="0"
							max="10"
							name={`activation-${i}`}
							bind:value={$inputParameters.activations[i]}
						/>
					</div>
				{/each}
			</section>

			<section>
				<h2 class="text-xl font-semibold">Weights</h2>
				{#each Array(nodeCount) as _, i}
					<div class="flex gap-2 justify-between">
						<label class="w-24" for={`weight-${i}`}
							><i>w<sub>{i}</sub></i> = {$parameters.weights[i]}</label
						>
						<input
							class="w-full"
							type="range"
							min="-10"
							max="10"
							name={`weight-${i}`}
							bind:value={$inputParameters.weights[i]}
						/>
					</div>
				{/each}
			</section>
		</form>
	</div>
	<canvas bind:this={canvasEl} class="h-screen" />
</div>
