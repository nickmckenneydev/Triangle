import { vec4, mat4 } from 'gl-matrix';
import { Deg2Rad } from './math_stuff';

export class Triangle {
	position: vec3;
	eulers: vec3;
	model: vec4;

	constructor(position: vec3, theta: number) {
		this.position = position;
		this.eulers = vec3.create();
		this.eulers[2] = theta;
	}
}
