// vim: set foldmethod=marker:
import * as opentype from "opentype.js";
import Vue = require('vue');
let pako = require('pako');
let App = require('./main.vue');
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

        loadFontFromLocalStorage();
    }
});

function url2array(dataurl: string) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return u8arr;
}

function blob2url(blob: Blob, callback: (key: string) => void){
    var fr = new FileReader();
    fr.onload = (e) => {
        callback( (e.target as any).result );
    }
    fr.readAsDataURL(blob);
}

export function loadFontFromLocalStorage(){
    let url = localStorage.getItem("fontfile");
    if(!url)return false;

    let buffer = url2array(url);

    let uncompressed = pako.inflate(buffer);

    appwindow.app.font = appwindow.font = appwindow.opentype.parse(uncompressed.buffer);
    return true;
}

export function saveFontToLocalStorage(){
    let buffer = appwindow.font.toArrayBuffer();
    let data = new Uint8Array(buffer);
    let compressed = pako.deflate(data);
    let blob = new Blob([compressed], {type: 'mime'});

    blob2url(blob, result => {
        localStorage.setItem("fontfile", result);
    });
}
