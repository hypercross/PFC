<style>
  .red {
    color: #f00;
  }
  #approot{
      display: flex;
      justify-content: center;
  }
  #leftpanel{
      width: 50%;
  }
  #leftpanel > iframe{
      width: calc(100% - 20px);
  }
  #rightpanel{
      width: 50%;
  }
  input[type=file]{
      display: none;
  }
  .mdl-button{
      margin-right: 1em;
      margin-top: 1em;
      margin-bottom: 1em;
  }
</style>

<template>
    <div id="approot">
        <div id="leftpanel">
            <iframe src="https://danielx.net/pixel-editor/" width="100%" height="100%"></iframe>
        </div>
        <div id="rightpanel">
            <div class="navrow">
                <h2>像素字体编辑器</h2>
                <p>使用的opentype.js库也不是很靠谱，用于生成字体还是存在各种各样的问题<br>
                    仅解决“戳像素画并作为字体字符保存”这一个问题，各种字体属性编辑基本上还是应该用专业软件处理<br>
                没有后端，暂定工作流还是载入字体，载入txt扩展字符集，编辑保存，然后下载</p>

                <span>
                    <label for="fileFont">
                        <span class="mdl-button mdl-button--raised">
                            载入字体
                        </span>
                    </label>
                    <input type="file" accept=".ttf,.otf" @change="fontFileChanged" id="fileFont">
                </span>
                <button class="mdl-button mdl-button--raised" v-on:click="downloadFont()">
                    下载字体
                </button>

                <span>
                    <label for="fileCharset">
                        <span class="mdl-button mdl-button--raised">
                            载入字符集txt
                        </span>
                    </label>
                    <input type="file" value="text file" accept=".txt" @change="charsetFileChanged" id="fileCharset"/>
                </span>

                <br>
                <div class="mdl-chip" style="vertical-align: bottom">
                    <span class="mdl-chip__text">字体像素分辨率: </span>
                    <select v-model="fontsize" style="vertical-align: middle; background: transparent; border: none">
                        <option disabled value="">pixel font size</option>
                        <option value='8'>8px</option>
                        <option value='10'>10px</option>
                        <option value='12'>12px</option>
                    </select>
                </div>

            </div>
            <canvas style="display: none; image-rendering: pixelated;" v-bind:width="fontsize" v-bind:height="fontsize"></canvas>
            <fontview :font="font"></fontview>
        </div>
    </div>
</template>

<script>
    let fontview = require('./fontview.vue');
    module.exports = {
        data(){
            return {
                font: window.font,
                fontsize: 12,
            };
        },
        methods:{
            downloadFont(){
                window.font.download();
            },
            fontFileChanged(e){
                console.log(e);
                let reader = new FileReader();
                reader.onload = e => {
                    let buffer = e.target.result;
                    console.log(buffer);
                    this.font = window.font = window.opentype.parse(buffer);
                }
                reader.readAsArrayBuffer(e.target.files[0]);

                e.target.value = null;
            },
            charsetFileChanged(e){
                console.log(e.target.files);
                let reader = new FileReader();
                reader.onload = e => {
                    let text = e.target.result;

                    let charset = new Set;
                    charset.add('\n');
                    charset.add('\r');
                    for(let one of text){
                        let glyph = this.font.charToGlyph(one);
                        let converted = String.fromCharCode(glyph.unicode);
                        if(converted != one && !charset.has(one)){
                            charset.add(one);

                            console.log('new char: ' +  one + ': ' + one.charCodeAt(0) + ', replaced by ' + glyph.unicode + ': ' + converted);
                            let nglyph = new window.opentype.Glyph({
                                index: this.font.glyphs.length,
                                name: one,
                                unicode: one.charCodeAt(0),
                                unicodes: [one.charCodeAt(0)],
                                font: this.font,
                                advanceWidth: this.font.unitsPerEm,
                                path: this.font.glyphs.glyphs[0].path
                            });
                            this.font.glyphs.push(nglyph.index,nglyph);
                            this.font.glyphNames.names.push(nglyph);
                            this.font.tables.cmap.glyphIndexMap[nglyph.unicode] = nglyph.index;
                        }
                    }
                };
                reader.readAsText(e.target.files[0], 'utf-8');

                e.target.value = null;
            }
        },
        components: {
            fontview
        }
    }
</script>
