<script lang="ts">
	import SquashingFunction from '$lib/enums/SquashingFunction';
	import NeuralNetwork from '$lib/models/NeuralNetwork';
	import Visualizer from '$lib/models/Visualizer';

	import { onMount } from 'svelte';

	let canvasEl: HTMLCanvasElement;

	onMount(() => {
		canvasEl.width = window.innerWidth;
		canvasEl.height = window.innerHeight;

		const ANN = new NeuralNetwork([3, 2, 6, 2, 3], SquashingFunction.Sigmoid);

		try {
			ANN.setInputLayerActivations([1, 1, 1]);
			ANN.setWeight(0, 3, -5);
			ANN.feedForward();

			const VIS = new Visualizer(canvasEl, ANN.getNeuralNetwork());
			VIS.draw();

			console.log(ANN.getNeuralNetwork());
		} catch (e) {
			console.error(e);
		}
	});
</script>

<canvas bind:this={canvasEl} class="h-screen" />
