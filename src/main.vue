<style>
  .red {
    color: #f00;
  }
  #approot{
      display: flex;
      justify-content: center;
  }
  #leftpanel{
      max-width: calc(100vh - 172px);
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
  canvas.pixel-editor{
      image-rendering: pixelated;
      width: calc(100% - 3em);
      background-color: lightgrey;
  }
</style>

<template>
    <div id="approot">
        <div id="leftpanel">
            <!--<iframe src="https://danielx.net/pixel-editor/" width="100%" height="100%"></iframe>-->
            <canvas class="pixel-editor" width="600" height="600"></canvas>
            <canvas class="pixel-preview" width="60" height="60"></canvas>
            <button class="mdl-button mdl-button--raised" v-on:click="clear()">
                清空
            </button>
            <button class="mdl-button mdl-button--raised" v-on:click="fit()">
                对齐阴影
            </button>
            <button class="mdl-button mdl-button--raised" v-on:click="save()">
                保存
            </button>
            <div class="mdl-card__actions mdl-card--border">
                <div class="mdl-textfield">
                    阴影字体：
                    <input class="mdl-textfield__input" type="text" v-model="refFont">
                </div>
                <div class="mdl-textfield">
                    对齐阴影阈值：
                    <input class="mdl-slider mdl-js-slider" type="range"
                    min="0" max="100" value="50" tabindex="0" v-model="fitThreshold">
                </div>
            </div>
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
                <button class="mdl-button mdl-button--raised" v-on:click="saveFontLocal()">
                    保存字体到浏览器缓存
                </button>

                <button class="mdl-button mdl-button--raised" v-on:click="loadFontLocal()">
                    从浏览器缓存加载字体
                </button>
                <span>
                    <label for="fileCharset">
                        <span class="mdl-button mdl-button--raised">
                            载入字符集txt
                        </span>
                    </label>
                    <input type="file" value="text file" accept=".txt" @change="charsetFileChanged" id="fileCharset"/>
                </span>
                <button class="mdl-button mdl-button--raised" v-on:click="openMerger()">
                    合并字体
                </button>

                <br>
                <div class="mdl-chip" style="vertical-align: bottom">
                    <span class="mdl-chip__text">字体像素分辨率: </span>
                    <select v-model="fontsize" style="vertical-align: middle; background: transparent; border: none">
                        <option disabled value="">pixel font size</option>
                        <option value='8'>8x8</option>
                        <option value='9'>9x9</option>
                        <option value='10'>10x10</option>
                        <option value='11'>11x11</option>
                        <option value='12'>12x12</option>
                    </select>
                </div>

            </div>
            <canvas style="display: none; image-rendering: pixelated;" v-bind:width="fontsize" v-bind:height="fontsize"></canvas>
            <fontview :font="font"
                v-on:clickselect="select"></fontview>
            <merger/>
        </div>
    </div>
</template>

<script>
    let merger = require('./merger.vue');
    let fontview = require('./fontview.vue');
    let PixelEditor = require('./peditor').default;
    let main = require('./main');
    module.exports = {
        data(){
            return {
                refFont: 'Arial',
                fitThreshold: 50,
                font: window.font,
                fontsize: 12,
            };
        },
        methods:{
            downloadFont(){
                var familyName = window.font.getEnglishName('fontFamily');
                var styleName = window.font.getEnglishName('fontSubfamily');
                var date = new Date().toJSON();
                var name = familyName + '-' + styleName + '-' + date + '.otf';

                var fresh = main.makeCleanFont(window.font);
                main.saveAsDownload(fresh.toArrayBuffer(), name, 'mime');
                // window.font.download(familyName + '-' + styleName + '-' + date + '.otf');
            },
            saveFontLocal(){
                main.saveFontToLocalStorage();
            },
            loadFontLocal(){
                main.loadFontFromLocalStorage();
            },
            select(i, char){
                this.editor.char = char;
                this.editor.fit();
            },
            clear(){
                this.editor.clear();
                this.editor.refresh();
            },
            fit(){
                this.editor.fit();
            },
            save(){
                this.editor.updateGlyph();
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
              main.loadCharset(e);
            },
            openMerger(){
                let merger = document.querySelector('dialog').showModal();
            }
        },
        watch:{
            fontsize(val){
                this.editor.fontsize = parseInt(val);
                this.editor.refresh();
            },
            refFont(val){
                this.editor.refFont = val;
                this.editor.refresh();
            },
            fitThreshold(val){
                this.editor.fitThreshold = parseFloat(val) / 250;
                this.editor.fit();
            }
        },
        mounted(){
            let canvas1 = this.$el.querySelector('canvas.pixel-editor');
            let canvas2 = this.$el.querySelector('canvas.pixel-preview');
            let editor = new PixelEditor(canvas1, canvas2);
            this.editor = editor;
            editor.refresh();
        },
        components: {
            fontview, merger
        }
    }
</script>
