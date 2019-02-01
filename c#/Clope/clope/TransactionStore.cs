using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Clope.common;

namespace Clope.clope
{
    class TransactionStore<T> : ITransactionStore
    {
        private readonly RuleSet<T> _ruleSet;
        private readonly IDataSource<T> _dataSource;

        private readonly Dictionary<int, Dictionary<object, UID>> _elementMaps;

        public TransactionStore (IDataSource<T> dataSource, RuleSet<T> ruleSet)
        {
            _ruleSet = ruleSet;
            _dataSource = dataSource;

            _elementMaps= new Dictionary<int, Dictionary<object, UID>>();
            Size = 0;
        }

        public int Size { get; private set; }

        public IEnumerator GetEnumerator() => (from T row in _dataSource select _ruleSet.ApplyWithRules(row) into elements select CreateTransaction(elements)).GetEnumerator();

        public void InitStore()
        {
            foreach (T row in _dataSource)
            {
                var elements = _ruleSet.Apply(row);
                for (var columnNumber = 0; columnNumber < elements.Length; columnNumber++)
                    AddElementToMaps(columnNumber, elements[columnNumber]);
            }
        }

        public Dictionary<object, UID> GetClassesIDs(int columnNumber)
        {
            return _elementMaps.TryGetValue(columnNumber, out var map) ? map : new Dictionary<object, UID>();
        }

        private void AddElementToMaps(int columnNumber, object element)
        {
            if (_elementMaps.TryGetValue(columnNumber, out var columnMap))
            {
                if (columnMap.ContainsKey(element)) return;
            }
            else { 
                columnMap = new Dictionary<object, UID>();
                _elementMaps.Add(columnNumber, columnMap);
            }
            columnMap.Add(element, new UID());
            Size++;
        }
    
        private Transaction CreateTransaction(IReadOnlyList<object> elements)
        {
            var transaction = new Transaction();
            for (var columnNumber = 0; columnNumber < elements.Count; columnNumber++)
            {
                var element = elements[columnNumber];
                if (element == null) { continue; }

                if (!_elementMaps.TryGetValue(columnNumber, out var columnMap))
                {
                    Console.WriteLine("Column was not found in maps, seems datasource is changed. Results will be incorrect!");
                    continue;
                }
                if (!columnMap.TryGetValue(element, out var uid))
                {
                    Console.WriteLine("Element was not found in map, seems datasource is changed. Results will be incorrect!");
                    continue;
                }

                transaction.Add(uid);
            }
            return transaction;
        }
    }
}
