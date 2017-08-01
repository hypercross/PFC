<template>
    <dialog class="mdl-dialog" style="min-width: 50%">
    <h4 class="mdl-dialog__title">合并字体</h4>
    <div class="mdl-dialog__content">
        <span v-for="(item, index) in files">
            <label v-bind:for="'merger-'+index">
                <span class="mdl-button mdl-button--raised">
                    {{item.name}}
                </span>
            </label>
            <input type="file" accept=".ttf,.otf" @change="e => onFileChange(e, index)" v-bind:id="'merger-'+index">
        </span>
        <span>
            <label for="merger-new">
                <span class="mdl-button mdl-button--raised">
                    载入字体
                </span>
            </label>
            <input type="file" accept=".ttf,.otf" @change="e => onFileChange(e, -1)" id="merger-new">
        </span>
    </div>
    <div class="mdl-dialog__actions">
      <button type="button" class="mdl-button" v-on:click="merge()">下载合并后的字体</button>
      <button type="button" class="mdl-button" v-on:click="close()">关闭</button>
    </div>
  </dialog>
</template>

<script>
    let main = require('./main');
    module.exports = {
        props: ["font"],
        data(){
            return {
               files: []
            };
        },
        methods: {
            merge(){
                main.mergeFontList(this.files);
            },
            close(){
                document.querySelector('dialog').close();
            },
            onFileChange(e, index){
                var file = e.target.files[0];
                console.log(index, '=>', file && file.name);
                if(index == -1 && file)
                    this.files.push(file);
                else if(index >= 0 && !file)
                    this.files.splice(index,1);
                else if(index >= 0 && file)
                    this.files.splice(index,1,file);
            }
        },
    };
</script>