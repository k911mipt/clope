using System.Collections.Generic;
using Clope.common;

namespace Clope.clope
{
    public class Clope
    {
        private readonly ITransactionStore _dataSource;
        private MathCache _mathCache;
        private readonly List<Cluster> _clusters;
        private readonly List<int> _tableClusters;

        public Clope(ITransactionStore dataSource, double repulsion)
        {
            _dataSource = dataSource;
            _clusters = new List<Cluster>();
            _tableClusters = new List<int>();
            _mathCache = new MathCache(repulsion);
        }

        public List<int> Run()
        {
            Initialize();
            Iterate();

            CleanClusters();
            return _tableClusters;
        }

        private void Initialize()
        {
            var iMaxProfitCluster = 0;
            foreach(Transaction transaction in _dataSource)
            {
                if (iMaxProfitCluster >= _clusters.Count - 1)
                    _clusters.Add(new Cluster(_dataSource.Size, ref _mathCache));
                iMaxProfitCluster = FindMaxProfitCluster(transaction);
                _clusters[iMaxProfitCluster].Add(transaction);
                _tableClusters.Add(iMaxProfitCluster);
            }
            if (_clusters[_clusters.Count - 1].isEmpty)
                _clusters.RemoveAt(_clusters.Count-1);
        }

        private void Iterate()
        {
            var isClusterMoved = true;
            while (isClusterMoved) {
                var rowIndex = 0;
                isClusterMoved = false;
                foreach(Transaction transaction in _dataSource)
                {
                    var iCurrentCluster = _tableClusters[rowIndex];
                    _clusters[iCurrentCluster].Delete(transaction);

                    var iMaxProfitCluster = FindMaxProfitCluster(transaction);
                    _clusters[iMaxProfitCluster].Add(transaction);

                    if (iMaxProfitCluster != iCurrentCluster) {
                        _tableClusters[rowIndex] = iMaxProfitCluster;
                        isClusterMoved = true;
                    }
                    rowIndex++;
                }
            }
        }

        private void CleanClusters() {
            for (var i = _clusters.Count - 1 ; i >= 0; i--) {
                if (!_clusters[i].isEmpty) continue;
                for (var j = 0; j < _tableClusters.Count; j++)
                    if (_tableClusters[j] > i)
                        _tableClusters[j]--;
                _clusters.RemoveAt(i);
            }
        }

        private int FindMaxProfitCluster(Transaction transaction)
        {
            double maxProfit = 0;
            var iMaxProfitCluster = 0;
            for (var i = 0; i < _clusters.Count; i++)
            {
                var profit = _clusters[i].CountDeltaAdd(transaction);
                if (profit <= maxProfit) continue;
                iMaxProfitCluster = i;
                maxProfit = profit;
            }
            return iMaxProfitCluster;
        }
    }
}