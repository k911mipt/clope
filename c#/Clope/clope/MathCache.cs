using System.Collections.Generic;

namespace Clope.clope
{
    public class MathCache
    {
        private double Repulsion { get; }
        private readonly List<double> _preCalculatedWpowR;
        public MathCache(double repulsion)
        {
            Repulsion = repulsion;
            _preCalculatedWpowR = new List<double>();
        }

        public double Grad(int S, int N, int width)
        {
            return S * N / GetWPowR(width);
        }

        private double GetWPowR(int w)
        {
            if (w >= _preCalculatedWpowR.Count) Prepare(w);
            return _preCalculatedWpowR[w];
        }

        private void Prepare(int w)
        {
            for (var i = _preCalculatedWpowR.Count; i <= w; i++)
                _preCalculatedWpowR.Add(System.Math.Pow(i, Repulsion));
        }


    }
}