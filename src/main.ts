// vim: set foldmethod=marker:
import * as opentype from "opentype.js";
import Vue = require('vue');
import {PNG} from 'pngjs'; 
let App = require('./main.vue');
import TraceMap from './tracer';

declare interface AppWindow extends Window{
    opentype: any;
    font: any;
    app: any;
    selectedGlyph: any;
    redrawSelected: Function;
    tm: any;
}
let appwindow = window as AppWindow;
appwindow.opentype = opentype;

opentype.load('3Dventure.ttf', function(err, font) {
    if (err) {
        alert('Could not load font: ' + err);
    } else {
        appwindow.font = font;

        appwindow.app = new Vue({
            el: '#app',
            render: h => h(App)
        }).$children[0];
    }
});

function appendImage(blob: Blob){
    let canvasCtx = (appwindow.app as Vue).$el.querySelector('canvas').getContext('2d');
    let objurl = URL.createObjectURL(blob);
    let img = new Image();
    img.src = objurl;
    img.onload = function() {
        canvasCtx.clearRect(0,0, img.width, img.height);
        canvasCtx.drawImage(img, 0, 0);
        let path = genPath();
        let {selectedGlyph} = appwindow;
        selectedGlyph.path = path;
        appwindow.redrawSelected();
    };
}

function genPath(){
    let canvasCtx = (appwindow.app as Vue).$el.querySelector('canvas').getContext('2d');
    let path = new (<any>opentype).Path();
    let fontsize = appwindow.app.fontsize;
    let pixels = canvasCtx.getImageData(0,0,fontsize, fontsize);
    let pd = pixels.data;

    let {descender, ascender} = (<any>window).font;
    let unit = (ascender - descender) / fontsize;
    path.unitsPerEm = appwindow.font.unitsPerEm;

    let tm = new TraceMap(pd, fontsize);
    appwindow.tm = tm;

    tm.fillPath(path);

    for(let one of path.commands){
        if(one.type === 'M' || one.type === 'L'){
            one.x = one.x * unit;
            one.y = (fontsize - one.y) * unit + descender;
        }
    }

    //for(let x = 0; x < fontsize; x ++)
    //for(let y = 0; y < fontsize; y ++){
        //let index = x + (fontsize - 1 - y) * fontsize;
        //if(pd[index * 4 + 3] == 255){
            //path.commands.push({type: 'M', x: x * unit,        y: descender + y * unit});
            //path.commands.push({type: 'L', x: x * unit + unit, y: descender + y * unit});
            //path.commands.push({type: 'L', x: x * unit + unit, y: descender + y * unit + unit});
            //path.commands.push({type: 'L', x: x * unit,        y: descender + y * unit + unit});
            //path.commands.push({type: 'Z'});
        //}
    //}
    return path;
}

window.addEventListener('message', e => {
    let {origin , data} = e;
    if(origin !== 'https://danielx.net')return;

    let {method, params} = data;
    if(method !== 'save')return;

    let [img] = params;

    appendImage(img.image);
}, false);

