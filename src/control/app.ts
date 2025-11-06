import { Renderer } from '../view/renderer';
import { Scene } from '../model/scence';
import { event } from 'jquery';

export class App {
	canvas: HTMLCanvasElement;
	renderer: Renderer;
	scence: Scene;

	keyLabel: HTMLElement;
	mouseXLabel: HTMLElement;
	mouseYLabel: HTMLElement;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.renderer = new Renderer(canvas);
		this.scence = new Scene();

		this.keyLabel = <HTMLElement>document.getElementById('key-label');
		$(document).on('keypress', (event) => {
			this.handle_keypress(event);
		});
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

	handle_keypress(event: JQuery.KeyPressEvent) {
		this.keyLabel.innerText = event.code;
	}
}
