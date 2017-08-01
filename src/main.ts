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

export function saveAsDownload(data: ArrayBuffer, name: string, type: string) {
     if (data != null && navigator.msSaveBlob)
        return navigator.msSaveBlob(new Blob([data], { type }), name);

    var a = document.createElement('a');
    a.style.display = "none";

    var url = window.URL.createObjectURL(new Blob([data], {type}));
    a.setAttribute("href", url);
    a.setAttribute("download", name);
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

export function makeCleanFont(font: any) {
    const input = font.glyphs.glyphs;
    const glyphs: any = [];
    console.log(input, input.length);
    for(let i = 0; input[i]; i ++){
        const glyph = input[i];
        if(glyph.path && glyph.path.commands.length > 0)
            glyphs.push(glyph);
    }

    const familyName = font.names.fontFamily.en;
    const styleName = font.names.fontSubfamily.en;
    const {unitsPerEm, ascender, descender} = font;

    const newFont = new opentype.Font({
        familyName, styleName, unitsPerEm, ascender, descender, glyphs
    });

    console.log(familyName, styleName, unitsPerEm, ascender, descender, glyphs);

    return newFont;
}

export function loadCharset(e: any){
    const font = appwindow.font;
    let reader = new FileReader();
    reader.onload = e => {
        let text = (e.target as any).result as string;

        let charset = new Set;
        charset.add('\n');
        charset.add('\r');
        for(let one of text){
            let glyph = font.charToGlyph(one);
            let converted = String.fromCharCode(glyph.unicode);
            if(converted != one && !charset.has(one)){
                charset.add(one);

                // console.log('new char: ' +  one + ': ' + one.charCodeAt(0) + ', replaced by ' + glyph.unicode + ': ' + converted);
                let nglyph = new opentype.Glyph({
                    index: font.glyphs.length,
                    name: one,
                    unicode: one.charCodeAt(0),
                    unicodes: [one.charCodeAt(0)],
                    font: font,
                    advanceWidth: font.unitsPerEm,
                    path: font.glyphs.glyphs[0].path
                });
                font.glyphs.push(nglyph.index, nglyph);
                font.glyphNames.names.push(nglyph);
                font.tables.cmap.glyphIndexMap[nglyph.unicode] = nglyph.index;
            }
        }
    };
    reader.readAsText(e.target.files[0], 'utf-8');

    e.target.value = null;
}

function readFile(file: File){
    return new Promise<ArrayBuffer>(resolve => {
        let reader = new FileReader();
        reader.onload = e => {
            let buffer = (e.target as any).result;
            resolve(buffer);
        }
        reader.readAsArrayBuffer(file);
    })
}

export function mergeFontList(files: File[]){
    if(!files || files.length <= 0)throw 'no font man!';
    Promise.all(files.map(readFile)).then(data => {
        const fonts = data.map(buffer => appwindow.opentype.parse(buffer));

        const glyphs: any = [];
        const used: {[key: string]: boolean} = {};

        for(const font of fonts){
            let repeat = 0;
            for(let i = 0; i < font.glyphs.length; i ++){
                const glyph = font.glyphs.glyphs[i];
                if(!glyph)continue;

                const full = glyph.path && glyph.path.commands.length > 0;
                if(!full)continue;

                let unicode = glyph.unicode.toString(16).toUpperCase();
                while(unicode.length < 4)unicode = '0' + unicode;
                glyph.name = `uni${unicode}`;

                if(used[glyph.name]){
                    repeat++;
                    continue;
                }
                used[glyph.name] = true;
                glyphs.push(glyph);
            }
            if(repeat > 0)alert(`字体${font.names.fullName.en}包含${repeat}个重复字符，重复字符将被忽略`);
        }

        const font = fonts[0];
        const familyName = font.names.fontFamily.en;
        const styleName = font.names.fontSubfamily.en;
        const {unitsPerEm, ascender, descender} = font;

        const newFont = new opentype.Font({
            familyName, styleName, unitsPerEm, ascender, descender, glyphs
        }) as any;
        console.log(newFont);
        saveAsDownload(newFont.toArrayBuffer(), 'merged-font.otf', 'mime');
    });
}
