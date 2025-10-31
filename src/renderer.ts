import shader from "./shaders/shaders.wgsl";
import { TriangleMesh } from "./triangle_mesh";
import { mat4 } from "gl-matrix";


export class Renderer {

    canvas: HTMLCanvasElement;

    // Device/Context objects
    adapter!: GPUAdapter;//!: Non-null assertion operator -> Says that these properties will be assigned before using them
    device!: GPUDevice;
    context!: GPUCanvasContext;
    format !: GPUTextureFormat;

    // Pipeline objects
    uniformBuffer!: GPUBuffer;//This will hold
    bindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    // Assets
    triangleMesh!: TriangleMesh;

    t: number = 0.0;


    private constructor(canvas: HTMLCanvasElement){//Shell of obj and sets canvas prop. Make private to block writing new Renderer(canvas). Forces to use create method
        this.canvas = canvas;
        this.t = 0.0;
    }
    //Public static means it belongs to renderer class
    //Async allows me to use await
    //Promise<Renderer> returns a Renderer Obj
    public static async create(canvas:HTMLCanvasElement): Promise<Renderer> {//Factory method
        const renderer = new Renderer(canvas);//Calls the constructor. Creates the empty shell of obj
        await renderer.Initialize();//
        return renderer;
    }
   private async Initialize() {

        await this.setupDevice();

        this.createAssets();
    
        await this.makePipeline();

        this.render();
    }

    async setupDevice() {

        //adapter: wrapper around (physical) GPU. it describes the features
        this.adapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
        //device is a wrapper around GPU functionality
        //Function calls are made through the device object
        this.device = <GPUDevice> await this.adapter?.requestDevice();
        this.context = <GPUCanvasContext> this.canvas.getContext("webgpu");
        this.format = "bgra8unorm";
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque"
        });

    }

    async makePipeline() {
        this.uniformBuffer = this.device.createBuffer({
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        
        const bindGroupLayout = this.device.createBindGroupLayout({//Declare I am using a uniform buffer
             entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {//speicifying buffer type
                        type:"uniform"
                    }
                }
            ]

        });
    
        this.bindGroup = this.device.createBindGroup({//Tells which uniform buffer I am using
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                }
            ]
        });
        
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });
    
        this.pipeline = this.device.createRenderPipeline({
            vertex : {
                module : this.device.createShaderModule({
                    code : shader
                }),
                entryPoint : "vs_main",
                buffers: [this.triangleMesh.bufferLayout,]
            },
    
            fragment : {
                module : this.device.createShaderModule({
                    code : shader
                }),
                entryPoint : "fs_main",
                targets : [{
                    format : this.format
                }]
            },
    
            primitive : {
                topology : "triangle-list"
            },
    
            layout: pipelineLayout
        });

    }

    createAssets() {
        this.triangleMesh = new TriangleMesh(this.device);
    }

    render() {
        //Create the matrices before doing command encoding
        const projection = mat4.create();
        //making projection matrix
        //writes to projection
        mat4.perspective(projection, Math.PI/4, 800/600, 0.1, 10);


        const view = mat4.create();
        mat4.lookAt(view, [-2, 0, 2], [0, 0, 0], [0, 0, 1]);


        const model = mat4.create();
        //Store, in the model matrix, the model matrix after rotating it by t radians around the z axis.
        mat4.rotate(model, model, this.t, [0,0,1]);

        //Write data in from uniform buffer
        //type BufferSource = ArrayBufferView<ArrayBuffer> | ArrayBuffer;
        //  Type 'IndexedCollection' is missing the following properties from type 'ArrayBuffer': byteLength, slice, [Symbol.toStringTag]
        
    
        //writeBuffer(buffer, bufferOffset, data, dataOffset, size)
        //data object representing the data source to write into the GPUBuffer. This can be an ArrayBuffer
        //mat4 os type FLoat32Array<ArrayBufferLike>
        // this.device.queue.writeBuffer(this.uniformBuffer, 0, model as unknown as Float32Array);
        // this.device.queue.writeBuffer(this.uniformBuffer, 64, <ArrayBuffer>view); 
        // this.device.queue.writeBuffer(this.uniformBuffer, 128, <ArrayBuffer>projection); 

        this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array(model));
       this.device.queue.writeBuffer(this.uniformBuffer, 64, new Float32Array(view));
        this.device.queue.writeBuffer(this.uniformBuffer, 128, new Float32Array(projection));

        //command encoder: records draw commands for submission
        const commandEncoder : GPUCommandEncoder = this.device.createCommandEncoder();
        //texture view: image view to the color buffer in this case
        const textureView : GPUTextureView = this.context.getCurrentTexture().createView();
        //renderpass: holds draw commands, allocated from command encoder
       const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0.5, g: 0.0, b: 0.25, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }]
        });
        
        renderpass.setPipeline(this.pipeline);
        renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
        renderpass.setBindGroup(0, this.bindGroup);
        renderpass.draw(3, 1, 0, 0);
        renderpass.end();
    
        this.device.queue.submit([commandEncoder.finish()]);
    

    }
}