import { Renderer } from '../view/renderer';
import { Scene } from '../model/scence';

export class App {
	canvas: HTMLCanvasElement;
	renderer: Renderer;
	scence: Scene;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.renderer = new Renderer(canvas);
		this.scence = new Scene();
	}

	async initialize() {
		await this.renderer.Initialize();
	}

	run = () => {
		var running: boolean = true;
		this.scence.update();
		this.renderer.render(this.scence.get_player(), this.scence.get_triangles());

		if (running) {
			requestAnimationFrame(this.run);
		}
	};
}
