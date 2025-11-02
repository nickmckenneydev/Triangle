import shader from './shaders/shaders.wgsl';
import { TriangleMesh } from '../triangle_mesh';
import { mat4 } from 'gl-matrix';
import { Material } from '../material';

//Owns all WebGPU objects and state of webgpu
export class Renderer {
	canvas: HTMLCanvasElement;

	// Device/Context objects
	//Adapter -> GPU available to browser
	adapter!: GPUAdapter; //!: Non-null assertion operator -> Says that these properties will be assigned before using them
	//Device -> Creates the Buffers,Textures,Pipelines,Bindgroups,Encoders. Its the main interface for all WebGPU operations
	device!: GPUDevice;
	//Context -> Links renderer to HTML canvas. Displays render image on screen. done via context.getCurrentTexture
	context!: GPUCanvasContext;
	//GPU stores and interepts pixel data in a texture
	format!: GPUTextureFormat;

	// Pipeline objects
	uniformBuffer!: GPUBuffer; // Chunk of memory on GPU.  Its the Data
	bindGroup!: GPUBindGroup; // groups all resouces so pipeline can work. This points to data. Holds references like GPUBuffer and GPUTexture that shader needs to call
	pipeline!: GPURenderPipeline; //Assembly line. This is an obj that contains vertex and frag shader. It is also the state

	// Assets
	triangleMesh!: TriangleMesh;
	material!: Material;

	t: number = 0.0;

	private constructor(canvas: HTMLCanvasElement) {
		//Shell of obj and sets canvas prop. Make private to block writing new Renderer(canvas). Forces to use create method
		this.canvas = canvas;
	}
	//Public static means it belongs to renderer class
	//Async allows me to use await
	//Promise<Renderer> returns a Renderer Obj
	public static async create(canvas: HTMLCanvasElement): Promise<Renderer> {
		//Factory method
		const renderer = new Renderer(canvas); //Calls the constructor. Creates the empty shell of obj
		await renderer.Initialize(); //
		return renderer;
	}
	private async Initialize() {
		await this.setupDevice(); //Must be completed before creatingAssets()

		await this.createAssets(); //Must be completed before makePipeline()

		await this.makePipeline();
	}

	async setupDevice() {
		//adapter: wrapper around (physical) GPU. it describes the features
		this.adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
		//device is a wrapper around GPU functionality
		//Function calls are made through the device object
		//Preps Canvas
		this.device = <GPUDevice>await this.adapter?.requestDevice();
		this.context = <GPUCanvasContext>this.canvas.getContext('webgpu');
		this.format = 'bgra8unorm';
		this.context.configure({
			device: this.device,
			format: this.format,
			alphaMode: 'opaque',
		});
	}

	async makePipeline() {
		this.uniformBuffer = this.device.createBuffer({
			size: 64 * 3,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const bindGroupLayout = this.device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {},
				},
			],
		});

		this.bindGroup = this.device.createBindGroup({
			layout: bindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this.uniformBuffer,
					},
				},
				{
					binding: 1,
					resource: this.material.view,
				},
				{
					binding: 2,
					resource: this.material.sampler,
				},
			],
		});

		const pipelineLayout = this.device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout],
		});

		this.pipeline = this.device.createRenderPipeline({
			vertex: {
				module: this.device.createShaderModule({
					code: shader,
				}),
				entryPoint: 'vs_main',
				buffers: [this.triangleMesh.bufferLayout],
			},

			fragment: {
				module: this.device.createShaderModule({
					code: shader,
				}),
				entryPoint: 'fs_main',
				targets: [
					{
						format: this.format,
					},
				],
			},

			primitive: {
				topology: 'triangle-list',
			},

			layout: pipelineLayout,
		});
	}

	async createAssets() {
		//Must be async
		this.triangleMesh = new TriangleMesh(this.device);
		this.material = new Material(); //Creating the class
		await this.material.initalize(this.device, 'dist/img/img.jpg'); //pass in device and file path to img
	}

	render() {
		this.t += 0.1; // Makes my triangle spin
		if (this.t > 2.0 * Math.PI) {
			this.t -= 2.0 * Math.PI;
		}
		//Create the matrices before doing command encoding
		const projection = mat4.create();
		//making projection matrix
		//writes to projection
		mat4.perspective(projection, Math.PI / 4, 800 / 600, 0.1, 10);

		const view = mat4.create();
		mat4.lookAt(view, [-2, 0, 2], [0, 0, 0], [0, 0, 1]);

		const model = mat4.create();
		//Store in the model matrix, the model matrix after rotating it by t radians around the z axis
		mat4.rotate(model, model, this.t, [0, 0, 1]); // This is always turning around due to requestframe

		//type landering -> tells compiler to forget orginal type and make new type
		this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array(model));
		this.device.queue.writeBuffer(this.uniformBuffer, 64, new Float32Array(view));
		this.device.queue.writeBuffer(this.uniformBuffer, 128, new Float32Array(projection));

		//command encoder: records draw commands for submission
		const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();
		//texture view: image view to the color buffer in this case
		const textureView: GPUTextureView = this.context.getCurrentTexture().createView();
		//renderpass: holds draw commands, allocated from command encoder
		const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: textureView,
					clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
					loadOp: 'clear',
					storeOp: 'store',
				},
			],
		});

		renderpass.setPipeline(this.pipeline);
		renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
		renderpass.setBindGroup(0, this.bindGroup);
		renderpass.draw(3, 1, 0, 0);
		renderpass.end();

		this.device.queue.submit([commandEncoder.finish()]);
	}
}
