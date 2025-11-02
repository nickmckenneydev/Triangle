import { vec4, mat4 } from 'gl-matrix';
import { Deg2Rad } from './math_stuff';

export class Camera {
	position: vec3;
	eulers: vec3;
	view: vec4;

	//this is the 3 props of a camera
	forwards: vec3;
	right: vec3;
	up: vec3;

	constructor(position: vec3, theta: number, phi: number) {
		this.position = position;
		this.eulers[2] = [0, phi, theta];

		//These are just starting values which will be overwritten
		this.forwards = vec3.create();
		this.right = vec3.create();
		this.up = vec3.create();
	}
	update() {
		this.forwards = [
			//rot around z axis

			//spherical coords
			Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(this.eulers[1]),
			Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(this.eulers[1]),
			Math.sin(this.eulers[1]),
		];

		//right vec of camera
		vec3.cross(this.right, this.forwards, [0, 0, 1]);

		//up vec of camera
		vec3.cross(this.up, this.right, this.forwards);

		//camera look at matrix
		var target: vec3 = vec3.create();
		vec3.add(target, this.position, this.forwards);
		this.view = mat4.create();
		mat4.lookAt(this.view, this.position, this.up);

		//this.model will have result of matrix|org matrix|translation vector
		mat4.translate(this.model, this.model, this.position);
		mat4.rotateZ(this.model, this.model, Deg2Rad(this.eulers[2]));
	}

	get_view(): mat4 {
		return this.view; //returns view matrix
	}
}
