import type { Position } from '$lib/models/Positions';

export default class DrawUtils {
	// Draws a neuron at a given position, with a given radius and fill color
	static drawNeuron(
		ctx: CanvasRenderingContext2D,
		position: Position,
		radius: number,
		fillColor: string
	) {
		ctx.beginPath();
		ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = fillColor;
		ctx.fill();
		ctx.stroke();
	}

	// Draws a connection from two given positions, with a given width and stroke color
	static drawConnection(
		ctx: CanvasRenderingContext2D,
		position1: Position,
		position2: Position,
		width: number,
		strokeColor: string
	) {
		ctx.beginPath();
		ctx.moveTo(position1.x, position1.y);
		ctx.lineTo(position2.x, position2.y);

		if (width) {
			ctx.strokeStyle = strokeColor;
			ctx.lineWidth = width;
			ctx.setLineDash([0, 0]);
		} else {
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			ctx.setLineDash([15, 15]);
		}
		ctx.stroke();
	}

	// Resets the line dash, stroke color and line width to their default values
	static resetLineStroke(ctx: CanvasRenderingContext2D) {
		ctx.setLineDash([0, 0]);
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
	}

	// Generates a grayscale color from a number between 0 and 1 (0 = black, 1 = white)
	static numToGrayscale(input: number) {
		// #region Error handling
		if (input > 1 || input < 0)
			throw new Error('DrawUtils.numToGrayscale: Number must be between 0 and 1');
		// #endregion

		const hex = Math.round(input * 255).toString(16);
		return `#${hex}${hex}${hex}`;
	}

	// Generates a red/green color from a negative/positive number (negative = red, positive = green)
	static numToRedGreen(input: number) {
		// #region Error handling
		if (input == 0) throw new Error('DrawUtils.numToGrayscale: Number must be between 0 and 1');
		// #endregion

		return input < 0 ? 'red' : 'lime';
	}
}
