import { Renderer } from '../view/renderer';
import { Scene } from '../model/scence';
import { event } from 'jquery';
import $ from 'jquery';

export class App {
	canvas: HTMLCanvasElement;
	renderer: Renderer;
	scence: Scene;

	keyLabel: HTMLElement;
	mouseXLabel: HTMLElement;
	mouseYLabel: HTMLElement;

	forwards_amount: number; //state of camera position
	right_amount: number; //state of camera position

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.renderer = new Renderer(canvas);
		this.scence = new Scene();

		this.keyLabel = <HTMLElement>document.getElementById('key-label');
		$(document).on('keydown', (event) => {
			this.handle_keypress(event);
		});
		$(document).on('keyup', (event) => {
			this.handle_keyrelease(event);
		});

		this.mouseXLabel = <HTMLElement>document.getElementById('mouse-x-label');
		this.mouseYLabel = <HTMLElement>document.getElementById('mouse-y-label');

		$(document).on('mousemove', (event) => {
			this.handle_mousemove(event);
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

	handle_keypress(event: JQuery.KeyDownEvent) {
		this.keyLabel.innerText = event.code;

		if (event.code == 'KeyW') {
			this.forwards_amount = 0.02;
		}
		if (event.code == 'KeyS') {
			this.forwards_amount = -0.02;
		}
		if (event.code == 'KeyA') {
			this.right_amount = -0.02;
		}
		if (event.code == 'KeyD') {
			this.right_amount = 0.02;
		}
	}

	handle_keyrelease(event: JQuery.KeyUpEvent) {
		this.keyLabel.innerText = event.code;

		if (event.code == 'KeyW') {
			this.forwards_amount = 0;
		}
		if (event.code == 'KeyS') {
			this.forwards_amount = 0;
		}
		if (event.code == 'KeyA') {
			this.right_amount = 0;
		}
		if (event.code == 'KeyD') {
			this.right_amount = 0;
		}
	}

	handle_mousemove(event: JQuery.MouseMoveEvent) {
		this.mouseXLabel.innerText = event.screenX.toString();
		this.mouseYLabel.innerText = event.screenX.toString();
	}
}
