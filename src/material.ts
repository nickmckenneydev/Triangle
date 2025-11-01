export class Material{
    texture:GPUTexture
    view:GPUTextureView//Protocol for accessing texture
    sampler:GPUSampler

    async initalize(device:GPUDevice,url:string){
        const response: Response = await fetch(url);
        const blob: Blob = await response.blob();
        const imageData:ImageBitmap = await createImageBitmap(blob);
    }
}