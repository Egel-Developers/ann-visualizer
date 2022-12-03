<script lang="ts">
	import SquashingFunction from '$lib/enums/SquashingFunction';
	import NeuralNetwork from '$lib/models/NeuralNetwork';
	import Visualizer from '$lib/models/Visualizer';

	import { onMount } from 'svelte';

	let canvasEl: HTMLCanvasElement;

	onMount(() => {
		canvasEl.width = window.innerWidth * 0.8;
		canvasEl.height = window.innerHeight;

		try {
			const ANN = new NeuralNetwork([3, 2, 6, 2, 3], SquashingFunction.Sigmoid);

			ANN.setInputLayerActivations([0.5, 1, 1]);
			ANN.setWeight(2, 1, 0, -5);
			ANN.feedForward();

			console.log(ANN.getNeuralNetwork());

			const VIS = new Visualizer(canvasEl, ANN.getNeuralNetwork());
			VIS.draw();
		} catch (e) {
			console.error(e);
		}
	});
</script>

<canvas bind:this={canvasEl} class="h-screen" />
