<script lang="ts">
	import SquashingFunction from '$lib/enums/SquashingFunction';
	import NeuralNetwork from '$lib/models/NeuralNetwork';

	const ANN = new NeuralNetwork([2, 1], SquashingFunction.Sigmoid);

	try {
		ANN.setInputLayerActivations([0.2, 0.5]);
		ANN.feedForward();
	} catch (e) {
		console.error(e);
	}

	console.log(ANN);
</script>

<pre>
    
{JSON.stringify(ANN.getNeuralNetwork(), null, 2)}
</pre>
