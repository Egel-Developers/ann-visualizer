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

	setParameters({
		activations: [0.22, 0.78, 0.34, 0.55, 1],
		weights: [-4, 2, 6, -7, 0],
		bias: 5
	});

	$: {
		if ($inputParameters) {
			console.log($inputParameters);

			formatAndSetParameters($inputParameters);

			drawLayer(canvasEl, $parameters, options);
		}
	}

	// Canvas code
	let canvasEl: HTMLCanvasElement;

	function resizeCanvas() {
		if (!canvasEl) return;

		// Make the canvas fill the screen
		canvasEl.width = document.documentElement.clientWidth * (4 / 5);
		canvasEl.height = document.documentElement.clientHeight;

		// Calculate all the relevant dimensions and offsets for the canvas
		options = calcDimensionsAndOffsets(
			$parameters.activations,
			canvasEl.width,
			canvasEl.height,
			50,
			50
		);

		// Draw the ANN layer
		drawLayer(canvasEl, $parameters, options);
	}

	function updateParameters() {
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
		resizeCanvas();

		window.addEventListener('resize', resizeCanvas);
	});
</script>

<div class="flex">
	<div class="w-1/5 bg-blue-400">
		<form class="flex flex-col gap-8 p-12">
			<div class="flex flex-col gap-2">
				<label for="nodeCount">Aantal input neuronen</label>
				<input type="number" name="nodeCount" bind:value={nodeCount} on:input={updateParameters} />
			</div>

			<div class="flex flex-col gap-2">
				<label for={`bias`}>Bias</label>
				<input type="range" min="-10" max="10" name="bias" bind:value={$inputParameters.bias} />
			</div>

			{#each Array(nodeCount) as _, i}
				<div class="flex flex-col gap-2">
					<label for={`activation-${i}`}>Activation {i}</label>
					<input
						type="range"
						min="0"
						max="10"
						name={`activation-${i}`}
						bind:value={$inputParameters.activations[i]}
					/>
				</div>
			{/each}

			{#each Array(nodeCount) as _, i}
				<div class="flex flex-col gap-2">
					<label for={`weight-${i}`}>Weight {i}</label>
					<input
						type="range"
						min="-10"
						max="10"
						name={`weight-${i}`}
						bind:value={$inputParameters.weights[i]}
					/>
				</div>
			{/each}
		</form>
	</div>
	<canvas bind:this={canvasEl} />
</div>
