<style>
  .red {
    color: #f00;
  }
  .glyph-container{
      height: 600px;
  }
</style>

<template>
    <div id="fontview">
      <span class="mdl-layout-title" style="margin-top: 0.5em;">字体属性: {{ fontSummary() }}</span>
        <div class="pagination">
            <button class="mdl-button mdl-button--raised" id="prev" v-on:click="indexFrom -= 50" v-bind:disabled="indexFrom <= 0">上一页</button>
            <button class="mdl-button mdl-button--raised" id="next" v-on:click="indexFrom += 50" v-bind:disabled="indexFrom + 50 >= font.numGlyphs">下一页</button>
            <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="indexInput"
            v-model="indexFromText" v-on:change="setIndexFrom()" style="width: 6em;">
            显示第{{ this.indexFrom }}到第{{ Math.min(this.indexFrom + 50, this.font.glyphs.length)}}个字符
        </div>
        <div id="glyphs">
            <div class="glyph-container">
                <fontglyph v-for="(item, index) in items()"
                    :name="item.name"
                    :glyph="item.glyph"
                    :index="index + indexFrom"
                    v-bind:selected="index + indexFrom == selected"
                    v-on:clickselect="select"></fontglyph>
            </div>
        </div>
    </div>
</template>

<script>
    let fontglyph = require('./glyph.vue');
    module.exports = {
        props: ["font"],
        data(){
            return {
                indexFrom: 0,
                indexFromText: 0,
                name: 'not loaded',
                selected: 0
            };
        },
        methods: {
            setIndexFrom(e){
                this.indexFrom = parseInt(this.indexFromText);
                if(isNaN(this.indexFrom))this.indexFrom = 0;
            },
            fontSummary(){
                return this.font.glyphs.length + ' glyphs, ascender ' + this.font.ascender + ', descender ' + this.font.descender + ', units per em ' + this.font.unitsPerEm;
            },
            items(){
                let res = [];
                let limit = Math.min(this.font.glyphs.length, this.indexFrom + 50);
                for(let i = this.indexFrom; i < limit; i ++){
                    let glyph = this.font.glyphs.glyphs[i];
                    let name = glyph.name;
                    res.push({glyph, name});
                }
                return res;
            },
            select(i){
                this.selected = i;
            }
        },
        components: {
            fontglyph
        }
    };
</script>
