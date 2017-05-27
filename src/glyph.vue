<style>
  canvas.glyph{
      width: 72px;
      height: 72px;
      background-color: lightgrey;
      display: block;
  }
  .glyph-name{
      padding: 6pt;
      border: none;
      width: 100%;
      background: transparent;
  }
  .glyph-item{
      margin: 3pt;
      width: 72px;
      display: inline-block;
      overflow: hidden;
      background-color: #bbbbbb
  }
  .glyph-item.selected{
      background-color: #7ed1e4;
  }
</style>

<template>
    <span class="glyph-item" v-bind:class="{ selected: selected}">
        <canvas class="glyph" width="72px" height="72px"></canvas>
        <button class="glyph-name" v-on:click="emitSelect()">
            <span class="unicode">{{glyph.unicode || 0}} {{char}}<br></span>
            {{ name }}
        </button>
    </span>
</template>

<script>
    module.exports = {
        props: ["glyph", "name", "selected", "index"],
        data(){
            return {
            };
        },
        computed: {
            char(){
                return String.fromCharCode(this.glyph.unicode);
            }
        },
        methods:{
            emitSelect(){
                this.$emit('clickselect', this.index);
            }
        },
        mounted(){
            let canvas = this.$el.querySelector('canvas');
            let descendPixel = 72 * font.descender / font.unitsPerEm;
            font.draw(canvas.getContext('2d'), String.fromCharCode(this.glyph.unicode), 0, 72 + descendPixel);

            if(this.selected){
                let {index, name, glyph} = this;
                console.log('glyph ' + index + ' ' + name + ' is selected');
                window.selectedGlyph = glyph;
                let vm = this;
                window.redrawSelected = () => vm.$forceUpdate();
            }
        },
        updated(){
            let canvas = this.$el.querySelector('canvas');
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);
            let descendPixel = 72 * font.descender / font.unitsPerEm;
            this.glyph.draw(ctx, 0, 72 + descendPixel);

            if(this.selected){
                let {index, name, glyph} = this;
                console.log('glyph ' + index + ' ' + name + ' is selected');
                window.selectedGlyph = glyph;
                let vm = this;
                window.redrawSelected = () => vm.$forceUpdate();
            }
        }
    };
</script>
