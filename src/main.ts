import { App } from './control/app';

async function main() {
	const canvas: HTMLCanvasElement = document.getElementById('gfx-main') as HTMLCanvasElement;
	if (!canvas) {
		console.log('Canvas Error failed to load');
		return 1;
	}

	const app = new App(canvas);
	app.initialize();
	app.run();
}
