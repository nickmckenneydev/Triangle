import { Renderer } from "./renderer";


async function main(){
    const canvas:HTMLCanvasElement = document.getElementById("gfx-main") as HTMLCanvasElement;
    if(!canvas){
        console.log("WOMP WOMP");
        return 1;
    }
    try {
        const renderer = await Renderer.create(canvas);
        //render loop
        function gameLoop() {
            
            renderer.render();//Call renderer public render method

            
            requestAnimationFrame(gameLoop);//Request the next frame from the browser
        }
      
        requestAnimationFrame(gameLoop);//restart
        
    } catch(error) {
        console.error("WOMP WOMP",error);
    }
}
main();