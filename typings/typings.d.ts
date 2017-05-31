declare function require(s: string): any;
interface CSS extends CSSStyleDeclaration {
    float: string | null;
}

declare interface AppWindow extends Window{
    opentype: any;
    font: any;
    app: any;
    selectedGlyph: any;
    redrawSelected: Function;
    tm: any;
}

