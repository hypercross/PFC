// vim: set foldmethod=marker:
const scale = 1;
export default class PixelEditor {
    public char: string = '我';
    public fontsize: number = 12;
    private _gridSize: number;
    private _ctx: CanvasRenderingContext2D;
    private _pctx: CanvasRenderingContext2D;
    private _pixels: boolean[] = [];

    public getPixel(x: number, y: number): boolean{
        if(x < 0 || y < 0 || x >= this.fontsize || y >= this.fontsize){
            return false;
        }
        return this._pixels[x + y * this.fontsize];
    }

    public setPixel(x: number, y: number, v: boolean){
        if(x < 0 || y < 0 || x >= this.fontsize || y >= this.fontsize){
            return;
        }
        this._pixels[x + y * this.fontsize] = v;
    }

    setPixelFromMouse(e: PointerEvent, mark: boolean){
        let {clientX, clientY} = e;
        let minu = this._gridSize / 2;
        let x = (clientX / scale - minu) / this._gridSize;
        let y = (clientY / scale - minu) / this._gridSize;
        this.setPixel(Math.floor(x), Math.floor(y), mark);
        this.refresh();
    }

    constructor(public canvas: HTMLCanvasElement, public preview: HTMLCanvasElement){

        canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
        });

        let ebtn = -1;
        canvas.addEventListener('pointerdown', e => {
            ebtn = e.button;
            if(ebtn == 0)
                this.setPixelFromMouse(e, true);
            else if(ebtn == 2)
                this.setPixelFromMouse(e, false);
        });
        canvas.addEventListener('pointerup', e => {
            ebtn = -1;
        });
        canvas.addEventListener('pointermove', e => {
            if(ebtn == 0)
                this.setPixelFromMouse(e, true);
            else if(ebtn == 2)
                this.setPixelFromMouse(e, false);
        });

        this._ctx = canvas.getContext('2d');
        this._pctx = preview.getContext('2d');
        this.fit();

        let was = window.onresize;
        window.onresize = (e: UIEvent) => {
            this.refresh();
            if(was)was.call(window, e);
        };
    }

    refresh(){// {{{
        let canvas = this.canvas;
        canvas.height = canvas.clientHeight / scale;
        canvas.width = canvas.clientWidth / scale;

        let ctx = this._ctx;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        this._gridSize = Math.floor(canvas.width / (this.fontsize+1));

        this.drawDashGrid();
        this.drawShadowChar();
        this.drawVoxels();

        let pctx = this._pctx;
        pctx.clearRect(0, 0, this.preview.width, this.preview.height);
        //pctx.textAlign = "center";
        //pctx.textBaseline = "middle";

        let psize = Math.floor(this.preview.width / (this.fontsize + 1));
        this.drawVoxelsOnContext(psize, pctx);
    }// }}}

    fit(){// {{{
        let ctx = this._ctx;
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        this._gridSize = Math.floor(this.canvas.width / (this.fontsize+1));

        this.drawShadowChar();
        this.fitVoxels();
        this.refresh();
    }// }}}

    drawDashGrid(){// {{{
        let size = this._gridSize;
        let ctx = this._ctx;

        ctx.beginPath();

        let minu = size / 2;
        let maxu = Math.floor(this.canvas.width / size) * size - size / 2;
        for(let x = minu; x <= maxu; x += size){
            ctx.moveTo(x,minu);
            ctx.lineTo(x,maxu);
            ctx.stroke();
        }

        for(let y = minu; y <= maxu; y += size){
            ctx.moveTo(minu,y);
            ctx.lineTo(maxu, y);
            ctx.stroke();
        }
    }// }}}

    drawShadowChar(){// {{{
        let char = this.char;
        let ctx = this._ctx;

        let size = this._gridSize * this.fontsize;
        ctx.font = `${size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(1,1,1,.4)";
        ctx.fillText(char, this.canvas.width / 2, this.canvas.height / 2);
    }// }}}

    fitVoxels(){// {{{
        let size = this._gridSize;
        let ctx = this._ctx;

        let minu = size / 2;
        let maxu = Math.floor(this.canvas.width / size) * size - size / 2;
        for(let x = 0; x < this.fontsize; x ++){
            for(let y = 0; y < this.fontsize; y ++){
                let px = minu + size * x;
                let py = minu + size * y;
                let pd = ctx.getImageData(px, py, size, size);

                let sum = 0;
                for(let i = 0; i < size * size; i ++){
                    sum += pd.data[i * 4+3];
                }
                sum /= size * size * 255;

                this.setPixel(x, y, sum > 0.2);
            }
        }
    }// }}}

    drawVoxels(){
        this.drawVoxelsOnContext(this._gridSize, this._ctx);
    }

    drawVoxelsOnContext(size: number, ctx: CanvasRenderingContext2D){// {{{
        let minu = size / 2;
        for(let x = 0; x < this.fontsize; x ++){
            for(let y = 0; y < this.fontsize; y ++){
                if(this.getPixel(x, y)){
                    let px = minu + size * x;
                    let py = minu + size * y;
                    ctx.fillStyle="#333333";
                    ctx.fillRect(px, py, size, size);
                }
            }
        }
    }// }}}
}
