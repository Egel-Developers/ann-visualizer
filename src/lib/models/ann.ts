export type Neuron = {
	activation: number;
	bias: number;

	radius: number;
	position: {
		x: number;
		y: number;
	};
};

export type Connection = {
	weight: number;
	width: number;
};
