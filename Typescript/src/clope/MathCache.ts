export default class MathCache {
    private repulsion: number;
    private precalculatedWPowR: number[];
    constructor(repulsion: number) {
        this.repulsion = repulsion;
        this.precalculatedWPowR = [];
    }

    /**
     * Gradient function for profit counting
     * @param S Square of cluster
     * @param N Number of objects in cluster
     * @param width width of cluster
     */
    public Grad(S: number, N: number, width: number): number {
        return S * N / this.GetWPowR(width);
    }

    private GetWPowR(w: number) {
        if (w >= this.precalculatedWPowR.length) { this.Prepare(w); }
        return this.precalculatedWPowR[w];
    }

    private Prepare(w: number): void {
        for (let i = this.precalculatedWPowR.length; i <= w; i++) {
            this.precalculatedWPowR.push(Math.pow(i, this.repulsion));
        }
    }
}
