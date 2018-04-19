export default class MathSupport {
    public readonly Repulsion: number;
    private PrecalculatedWPowR: number[];
    constructor(r: number) {
        this.Repulsion = r;
        this.PrecalculatedWPowR = [];
    }
    private Prepare(w: number): void {
        for (let i = this.PrecalculatedWPowR.length; i <= w; i++)
            this.PrecalculatedWPowR.push(Math.pow(i, this.Repulsion))
    }
    public GetWPowR(w: number) {
        if (w >= this.PrecalculatedWPowR.length) this.Prepare(w);
        return this.PrecalculatedWPowR[w];
    }
}