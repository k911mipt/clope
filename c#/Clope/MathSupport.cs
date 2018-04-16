using System.Collections.Generic;

namespace Clope
{
    internal class MathSupport
    {
        public double Repulsion { get; }
        private readonly List<double> _preCalculatedWpowR;

        public double GetPreCalculatedWpowR(int w)
        {
            if (w < _preCalculatedWpowR.Count) return _preCalculatedWpowR[w];
            for (var i = _preCalculatedWpowR.Count; i <= w; i++)
                _preCalculatedWpowR.Add(System.Math.Pow(i, Repulsion));
            return _preCalculatedWpowR[w];
        }

        public MathSupport(double repulsion)
        {
            Repulsion = repulsion;
            _preCalculatedWpowR = new List<double>();
        }
    }
}