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
</style>

<template>
    <div id="approot">
        <div id="leftpanel">
            <iframe src="https://danielx.net/pixel-editor/" width="100%" height="100%"></iframe>
        </div>
        <div id="rightpanel">
            <span>fontsize: </span>
            <select v-model="fontsize">
                <option disabled value="">pixel font size</option>
                <option value='8'>8px</option>
                <option value='10'>10px</option>
                <option value='12'>12px</option>
            </select>
            <br>
            <span>
                expand charset:
                <input type="file" value="text file" accept=".txt" @change="fileChanged"/>
            </span>
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
            fileChanged(e){
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
                        }
                    }
                    //this.font = window.font = new window.opentype.Font({
                        //familyName: this.font.names.fontFamily,
                        //styleName: this.font.names.fontSubfamily,
                        //unitsPerEm: this.font.unitsPerEm,
                        //ascender: this.font.ascender,
                        //descender: this.font.descender,
                        //glyphs: this.font.glyphs
                    //});
                    //console.log('building new font');
                    //console.log(this.font);
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
