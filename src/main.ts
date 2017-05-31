// vim: set foldmethod=marker:
import * as opentype from "opentype.js";
import Vue = require('vue');
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
    }
});
