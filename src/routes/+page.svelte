<script lang="ts">
	import { onMount } from 'svelte';
	import { weightedSum, sigmoid, relu } from '$lib/scripts/activation-function';
	import type { Neuron, Connection } from '$lib/models/ann';
	import { numToGrayscale, numToRedGreen } from '$lib/scripts/numToColor';

	let weights = [-4, 2, 6, -7, 0];
	let activations = [0.22, 0.78, 0.34, 0.55, 1];
	let bias = 5;

	let sum = weightedSum(weights, activations, bias);
	let newActivation = sigmoid(sum);

	// Canvas code
	let canvasEl: HTMLCanvasElement;

	// NOTE: Draws single layer, with one output neuron
	function drawLayer(activations: number[], weights: number[], bias = 0) {
		try {
			// Run some checks
			if (!canvasEl) return;

			if (!activations.length || !weights.length)
				throw new Error('Must supply activations and weights');

			if (activations.length !== weights.length)
				throw new Error('Must have the same number of activations and weights');

			// Get the canvas ready
			const ctx = canvasEl.getContext('2d');
			if (!ctx) return;

			ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

			// Define some constants
			const neuronRadius = 50;
			const verSpace = 50;

			// Create container
			const totalWidth = 800;
			const totalHeight =
				activations.length * neuronRadius * 2 + verSpace * (activations.length - 1);

			const dimensions = [
				document.documentElement.clientWidth,
				document.documentElement.clientHeight
			];

			const horOffset = dimensions[0] / 2 - totalWidth / 2;
			const verOffset = dimensions[1] / 2 - totalHeight / 2;

			// Draw the container
			// ctx.beginPath();
			// ctx.rect(horOffset, verOffset, totalWidth, totalHeight);
			// ctx.stroke();

			// Create the input neurons
			let inputNeurons: Neuron[] = [];

			activations.forEach((activation, index) => {
				inputNeurons.push({
					activation,
					bias: 0,
					radius: neuronRadius,
					position: {
						x: horOffset + neuronRadius,
						y: verOffset + neuronRadius + index * 2 * neuronRadius + verSpace * index
					}
				});
			});

			const outputNeuron: Neuron = {
				activation: 0,
				bias,
				radius: neuronRadius,
				position: {
					x: horOffset - neuronRadius + totalWidth,
					y: verOffset + totalHeight / 2
				}
			};

			// Draw the connections
			inputNeurons.forEach((inputNeuron, index) => {
				ctx.beginPath();
				ctx.moveTo(inputNeuron.position.x, inputNeuron.position.y);
				ctx.lineTo(outputNeuron.position.x, outputNeuron.position.y);

				if (weights[index]) {
					ctx.strokeStyle = numToRedGreen(weights[index]);
					ctx.lineWidth = Math.abs(weights[index]);
				} else {
					ctx.strokeStyle = 'black';
					ctx.lineWidth = 1;
					ctx.setLineDash([15, 15]);
				}
				ctx.stroke();
			});

			// Reset line dash
			ctx.setLineDash([0, 0]);
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;

			// Draw the input neurons
			inputNeurons.forEach((inputNeuron) => {
				ctx.beginPath();
				ctx.arc(inputNeuron.position.x, inputNeuron.position.y, inputNeuron.radius, 0, 2 * Math.PI);
				ctx.fillStyle = numToGrayscale(inputNeuron.activation);
				ctx.fill();
				ctx.stroke();
			});

			// Draw the output neuron
			ctx.beginPath();
			ctx.arc(
				outputNeuron.position.x,
				outputNeuron.position.y,
				outputNeuron.radius,
				0,
				2 * Math.PI
			);
			ctx.fillStyle = numToGrayscale(newActivation);
			ctx.fill();
			ctx.stroke();
		} catch (e) {
			if (e instanceof Error) console.error(e.message);
		}
	}

	function resizeCanvas() {
		if (!canvasEl) return;

		const dimensions = [
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		];
		canvasEl.width = dimensions[0];
		canvasEl.height = dimensions[1];

		drawLayer(activations, weights, bias);
	}

	onMount(() => {
		resizeCanvas();

		window.addEventListener('resize', resizeCanvas);
	});
</script>

<canvas bind:this={canvasEl} />

<!-- <div class="flex">
	<div>
		{#each activations as activation}
			<p>{activation}</p>
		{/each}
	</div>

	<div>
		{#each weights as weight}
			<p>{weight}</p>
		{/each}
	</div>
</div> -->
