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
}
