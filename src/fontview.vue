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
        <div>font summary: {{ fontSummary() }}</div>
        <div class="pagination">
            <button id="prev" v-on:click="indexFrom -= 50" v-bind:disabled="indexFrom <= 0">prev</button>
            <button id="next" v-on:click="indexFrom += 50" v-bind:disabled="indexFrom + 50 >= font.numGlyphs">next</button>
            showing {{ this.indexFrom }} to {{ Math.min(this.indexFrom + 50, this.font.glyphs.length)}}
            <input v-model="indexFrom" placeholder="edit me">
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
                name: 'not loaded',
                selected: 0
            };
        },
        methods: {
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
