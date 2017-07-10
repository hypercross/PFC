declare module "opentype.js" {
    function load(path: string, cb: (err: any, font: any) => void): void;
    class Font{
        public constructor(options: any);
    }
    class Path{
        public constructor(options: any);
    }
    class Glyph{
        public constructor(options: any);
        public index: number;
        public unicode: number;
    }
}
