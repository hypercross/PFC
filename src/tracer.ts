// vim: set foldmethod=marker:
export default class TracerMap {
    constructor(private data: Uint8ClampedArray, public size: number){
    }

    getPixel(x: number, y: number): boolean {
        if(x < 0 || x >= this.size || y < 0 || y >= this.size)
            return false;
        let index = x + y * this.size;
        return this.data[index * 4 + 3] == 255; 
    }

    fillPath(path: any){
        let visited: boolean[] = [];
        let current: boolean[] = [];

        for(let x = 0; x < this.size; x ++)
        for(let y = 0; y < this.size; y ++){
            let index = x + y * this.size;
            if(this.getPixel(x, y) && !visited[index]){
                this.floodfill(current, x, y);

                for(let i = 0; i < this.size * this.size; i ++){
                    visited[i] = visited[i] || current[i];
                }

                this.fillContour(path, current, x, y);
            }
        }
    }

    fillContour(path: any, current: boolean[], x: number, y: number){
        let tx = x;
        let ty = y;
        let d = 1;
        let dir = 0; //x+ y+ x- y-
        let start = true;

        path.commands.push({type: 'M', x: tx, y: ty});
        //console.log(`move to ${tx},${ty}`);
        while(start || tx != x || ty != y || dir != 0){
            start = false;
        if(dir == 0){// {{{
            while(this.getPixel(tx + d, ty) && !this.getPixel(tx + d, ty - 1)){
                d++;
            }
            //console.log(`line from ${tx},${ty} to ${tx+d},${ty}`);
            path.commands.push({type: 'L', x: tx+d, y: ty});
            let outer = this.getPixel(tx + d, ty - 1);
            let inner = this.getPixel(tx + d, ty);
            if(!inner){
                tx = tx + d - 1;
                ty = ty;
                dir = 1;
            }else if(outer){
                tx = tx + d;
                ty = ty - 1;
                dir = 3;
            }
            d = 1;// }}}
        } else if(dir == 1){// {{{
            while(this.getPixel(tx, ty + d) && !this.getPixel(tx + 1, ty + d)){
                d++;
            }
            //console.log(`line from ${tx+1},${ty} to ${tx+1},${ty+d}`);
            path.commands.push({type: 'L', x: tx+1, y: ty+d});
            let outer = this.getPixel(tx + 1, ty + d);
            let inner = this.getPixel(tx    , ty + d);
            if(!inner){
                ty = ty + d - 1;
                tx = tx;
                dir = 2;
            }else if(outer){
                ty = ty + d;
                tx = tx + 1;
                dir = 0;
            }
            d = 1;// }}}
        }else if(dir == 2){// {{{
            while(this.getPixel(tx - d, ty) && !this.getPixel(tx - d, ty + 1)){
                d++;
            }
            //console.log(`line from ${tx+1},${ty+1} to ${tx+1-d},${ty+1}`);
            path.commands.push({type: 'L', x: tx+1-d, y: ty+1});
            let outer = this.getPixel(tx - d, ty + 1);
            let inner = this.getPixel(tx - d, ty);
            if(!inner){
                tx = tx - d + 1;
                ty = ty;
                dir = 3;
            }else if(outer){
                tx = tx - d;
                ty = ty + 1;
                dir = 1;
            }
            d = 1;// }}}
        } else if(dir == 3){// {{{
            while(this.getPixel(tx, ty - d) && !this.getPixel(tx - 1, ty - d)){
                d++;
            }
            //console.log(`line from ${tx},${ty+1} to ${tx},${ty+1-d}`);
            path.commands.push({type: 'L', x: tx, y: ty+1-d});
            let outer = this.getPixel(tx - 1, ty - d);
            let inner = this.getPixel(tx    , ty - d);
            if(!inner){
                ty = ty - d + 1;
                tx = tx;
                dir = 0;
            }else if(outer){
                ty = ty - d;
                tx = tx - 1;
                dir = 2;
            }
            d = 1;
        }// }}}
        }
        path.commands[path.commands.length - 1].type = 'Z';
    }

    floodfill(mask: boolean[], x: number, y: number){
        let index = x + y * this.size;
        if(mask[index])return;
        if(!this.getPixel(x,y))return;

        mask[index] = true;

        this.floodfill(mask, x+1, y);
        this.floodfill(mask, x-1, y);
        this.floodfill(mask, x, y+1);
        this.floodfill(mask, x, y-1);
    }
}
