<script lang="ts">
	import { weightedSum, sigmoid, relu } from '../lib/scripts/activation-function';

	let weights = [4, 2, 6, 7, 0];
	let activations = [0.99, 0.34, 0.66, 0.12, 0.09];
	let bias = -5;

	let sum = weightedSum(weights, activations, bias);
	let newActivation = sigmoid(sum);
</script>

<p>{newActivation}</p>
