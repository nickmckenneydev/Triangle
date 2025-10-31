import { Renderer } from "./renderer";


async function main(){
    const canvas:HTMLCanvasElement = document.getElementById("gfx-main") as HTMLCanvasElement;
    if(!canvas){
        console.log("WOMP WOMP");
        return 1;
    }
    try {
        const renderer = await Renderer.create(canvas);
        //Im guessing I put a render LOOP here
        
    } catch(error) {
        console.error("WOMP WOMP",error);
    }
}
main();