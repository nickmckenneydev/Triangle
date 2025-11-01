import { Renderer } from './renderer';

async function main() {
	const canvas: HTMLCanvasElement = document.getElementById('gfx-main') as HTMLCanvasElement;
	if (!canvas) {
		console.log('Canvas Error failed to load');
		return 1;
	}

	const renderer = await Renderer.create(canvas);

	function gameLoop() {
		requestAnimationFrame(gameLoop); //Request the next frame from the browser. Schdule work first, then do rendering

		renderer.render(); //Call renderer public render method
	}

	requestAnimationFrame(gameLoop); //Entry point into loop. Only called once. gameLoop is the call back function
}
main();
