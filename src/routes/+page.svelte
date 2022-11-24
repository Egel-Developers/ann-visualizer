<script lang="ts">
	import { onMount } from 'svelte';
	import { drawLayer } from '$lib/scripts/drawLayer';

	let weights = [-4, 2, 6, -7, 0];
	let activations = [0.22, 0.78, 0.34, 0.55, 1];
	let bias = 5;

	// Canvas code
	let canvasEl: HTMLCanvasElement;

	function resizeCanvas() {
		if (!canvasEl) return;

		const dimensions = [
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		];
		canvasEl.width = dimensions[0];
		canvasEl.height = dimensions[1];

		// Draw the ANN layer
		drawLayer(canvasEl, activations, weights, bias);
	}

	onMount(() => {
		resizeCanvas();

		window.addEventListener('resize', resizeCanvas);
	});
</script>

<canvas bind:this={canvasEl} />
