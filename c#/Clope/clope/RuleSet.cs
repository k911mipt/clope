using System;
using System.Collections.Generic;
using Clope.common;

namespace Clope.clope
{
    public struct RuleConfig<T>
    {
        public Func<T, object[]> ConvertFunc;
        public HashSet<object> skipElements;
        public HashSet<int> columnsToSkip;
    }
    public class RuleSet<T>
    {
        //protected List<object> ConvertFunc(T row);
        private RuleConfig<T> _config;

        public RuleSet(Func<T, object[]> convertFunc,
                        object[] nullElements,
                        int[] columnsToSkip)
        {
            _config.ConvertFunc = convertFunc;
            _config.skipElements = CreateSet(nullElements);
            _config.columnsToSkip = CreateSet(columnsToSkip);
        }

        public void Update(Func<T, object[]> convertFunc,
                        object[] nullElements,
                        int[] columnsToSkip)
        {
            _config.ConvertFunc = convertFunc;
            _config.skipElements = CreateSet(nullElements);
            _config.columnsToSkip = CreateSet(columnsToSkip);
        }

        public object[] ApplyWithRules(T row)
        {
            var filteredElements = Apply(row);
            for (var columnNumber = 0; columnNumber < filteredElements.Length; columnNumber++)
            {
                var element = filteredElements[columnNumber];
                if (_config.columnsToSkip.Contains(columnNumber) || _config.skipElements.Contains(element))
                {
                    filteredElements[columnNumber] = null;
                }
            }
            return filteredElements;
        }

        public object[] Apply(T row)
        {
            return _config.ConvertFunc(row);
        }

        private static HashSet<TArray> CreateSet<TArray>(TArray[] array)
        {
            return (array != null) ? new HashSet<TArray>(array) : new HashSet<TArray>();
        }
    }
}