<script lang="ts">
	import { onMount } from 'svelte';
	import { drawLayer } from '$lib/scripts/drawLayer';
	import { calcDimensionsAndOffsets } from '$lib/scripts/drawLayer';

	let weights = [-4, 2, 6, -7, 0];
	let activations = [0.22, 0.78, 0.34, 0.55, 1];
	let bias = 5;

	// Canvas code
	let canvasEl: HTMLCanvasElement;

	function resizeCanvas() {
		if (!canvasEl) return;

		// Make the canvas fill the screen
		canvasEl.width = document.documentElement.clientWidth * (4 / 5);
		canvasEl.height = document.documentElement.clientHeight;

		// Calculate all the relevant dimensions and offsets for the canvas
		const options = calcDimensionsAndOffsets(activations, canvasEl.width, canvasEl.height, 50, 50);

		// Draw the ANN layer
		drawLayer(canvasEl, activations, weights, bias, options);
	}

	onMount(() => {
		resizeCanvas();

		window.addEventListener('resize', resizeCanvas);
	});
</script>

<div class="flex">
	<div class="w-1/5 bg-blue-400">
		<form />
	</div>
	<canvas bind:this={canvasEl} />
</div>
