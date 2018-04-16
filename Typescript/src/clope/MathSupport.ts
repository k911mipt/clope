class MathSupport {
    public readonly Repulsion: number;
    private PrecalculatedWPowR: Array<number>;
    constructor(r: number) {
        this.Repulsion = r;
        this.PrecalculatedWPowR = new Array<number>();
    }
    public GetWPowR(w: number) {
        if (w >= this.PrecalculatedWPowR.length)
            for (let i = this.PrecalculatedWPowR.length; i <= w; i++)
                this.PrecalculatedWPowR.push(Math.pow(i, this.Repulsion))
        return this.PrecalculatedWPowR[w];
    }
}