// vim: set foldmethod=marker:
import * as opentype from "opentype.js";
import TraceMap from './tracer';
export default class PixelEditor {
    public char: string = '我';
    public fontsize: number = 12;
    public refFont: string = 'Arial';
    public fitThreshold: number = 0.2;
    private _gridSize: number;
    private _ctx: CanvasRenderingContext2D;
    private _pctx: CanvasRenderingContext2D;
    private _pixels: boolean[] = [];
    private _ssx = 0;
    private _ssy = 0;
    private _sss = 0;

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

    clear(){
        this._pixels.length = 0;
    }

    setPixelFromMouse(e: MouseEvent, mark: boolean){
        let {pageX, pageY} = e;
        pageX -= (e.target as HTMLCanvasElement).offsetLeft;
        pageY -= (e.target as HTMLCanvasElement).offsetTop;

        let minu = this._gridSize / 2;
        let x = (pageX - minu) / this._gridSize;
        let y = (pageY - minu) / this._gridSize;
        x = Math.floor(x);
        y = Math.floor(y);
        //console.log(`${pageX} - ${x} ${pageY} - ${y}`);
        this.setPixel(x, y, mark);
        this.refresh();
    }

    constructor(public canvas: HTMLCanvasElement, public preview: HTMLCanvasElement){

        canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
        });

        let ebtn = -1;
        let sx = 0;
        let sy = 0;
        canvas.addEventListener('mousedown', e => {
            ebtn = e.button;
            if(ebtn == 0)
                this.setPixelFromMouse(e, true);
            else if(ebtn == 2)
                this.setPixelFromMouse(e, false);
            else if(ebtn == 1){
                sx = e.pageX;
                sy = e.pageY;
            }
        });
        canvas.addEventListener('mouseup', e => {
            ebtn = -1;
        });
        canvas.addEventListener('mousemove', e => {
            if(ebtn == 0)
                this.setPixelFromMouse(e, true);
            else if(ebtn == 2)
                this.setPixelFromMouse(e, false);
            else if(ebtn == 1){
                this._ssx += (e.pageX - sx);
                this._ssy += (e.pageY - sy);
                sx = e.pageX;
                sy = e.pageY;
                this.refresh();
            }
        });

        canvas.addEventListener('wheel', e => {
            e.preventDefault();

            this._sss -= e.deltaY / 100;
            if(this._sss < -10)this._sss = -10;
            if(this._sss >  12)this._sss =  12;
            this.refresh();
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
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;

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
        let maxu = minu + size * this.fontsize;
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

        let size = this._gridSize * this.fontsize * (1.0 + this._sss * 0.05);
        ctx.font = `${size}px ${this.refFont}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(1,1,1,.4)";
        ctx.fillText(char, this.canvas.width / 2 + this._ssx, this.canvas.height / 2 + this._ssy);
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

                this.setPixel(x, y, sum > this.fitThreshold);
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

    updateGlyph(){
        let w = window as AppWindow;
        let fontsize = w.app.fontsize;
        let {descender, ascender} = w.font;
        let unit = Math.min(ascender - descender, w.font.unitsPerEm) / fontsize;

        let path = new (<any>opentype).Path();
        path.unitsPerEm = w.font.unitsPerEm;

        let tm = new TraceMap(this._pixels, this.fontsize);
        w.tm = tm;

        tm.fillPath(path);

        let minx = fontsize * unit;
        let maxx = 0;
        for(let one of path.commands){
            if(one.type === 'M' || one.type === 'L'){
                one.x = one.x * unit;
                minx = Math.min(minx, one.x);
                maxx = Math.max(maxx, one.x);
                one.y = (fontsize - one.y) * unit + descender;
            }
        }
        for(let one of path.commands){
            if(one.type === 'M' || one.type === 'L'){
                one.x -= minx;
            }
        }

        let {selectedGlyph} = w;
        selectedGlyph.advanceWidth = maxx - minx + unit;
        selectedGlyph.path = path;
        w.redrawSelected();
    }
}
