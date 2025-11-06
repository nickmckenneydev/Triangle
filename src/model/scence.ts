import { Triangle } from './triangle';
import { Camera } from './camera';

export class Scene {
	triangles: Triangle[];
	player: Camera;

	constructor() {
		this.triangles = [];
		this.triangles.push(new Triangle([2, 0, 0], 0));
		this.player = new Camera([-2, 0, 0.5], 0, 0);
	}

	update() {
		this.triangles.forEach((triangle) => triangle.update());
		this.player.update();
	}

	spin_player(dX: number, dY: number) {
		this.player.eulers[2] -= dX;
		this.player.eulers[2] %= 360;

		this.player.eulers[1] = Math.min(89, Math.max(-89, this.player.eulers[1] + dY));
	}

	get_player(): Camera {
		return this.player;
	}

	get_triangles(): Triangle[] {
		return this.triangles;
	}
}
