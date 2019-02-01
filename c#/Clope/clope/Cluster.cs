using System;
using Clope.common;

namespace Clope.clope
{
    internal class Cluster
    {
        private int _width,                  
                    _square;
        private readonly int[] _occ;
        private int _numTransactions;
        private readonly MathCache _mathCache;

        /// <summary>
        /// Конструктор класса
        /// </summary>
        /// <param name="capacity">максимальное количество различных объектов. Число формируется в классе TextFileDatabaseHandler, prop CountObjects</param>
        /// <param name="mathCache">Воспомогательный класс с кэшированием вычисленных значений для функции Grad</param>
        public Cluster(int capacity, ref MathCache mathCache)
        {
            _mathCache = mathCache;
            _width = 0;
            _square = 0;
            _numTransactions = 0;
            _occ = new int[capacity];
        }

        public bool isEmpty => _numTransactions == 0;

        /// <summary>
        /// Добавление транзакции
        /// </summary>
        /// <param name="transaction">транзакция</param>
        public void Add(Transaction transaction)
        {
            _square += transaction.Count;
            _numTransactions++;
            foreach (var uid in transaction)
            {
                if (IsUIDisMissing(uid))
                    _width++;
                _occ[uid.Value] = (_occ[uid.Value] | 0) + 1;
            }

        }

        /// <summary>
        /// Удаление транзакции
        /// </summary>
        /// <param name="transaction">транзакция</param>
        public void Delete(Transaction transaction)
        {
            _square -= transaction.Count;
            _numTransactions--;
            foreach (var uid in transaction)
            {
                _occ[uid.Value]--;
                if (IsUIDisMissing(uid))
                    _width--;
            }
        }


        /// <summary>
        /// Вычисление прироста профита в случае добавления транзакции
        /// </summary>
        /// <param name="transaction">транзакция</param>
        /// <returns>изменение профита</returns>
        public double CountDeltaAdd(Transaction transaction)
        {
            if (_numTransactions == 0)
                return _mathCache.Grad(transaction.Count, _numTransactions + 1, transaction.Count);
            var S_new = _square + transaction.Count;
            var W_new = _width;
            foreach (var uid in transaction)
                if (_occ[uid.Value] == 0)
                    W_new++;

            return _mathCache.Grad(S_new, _numTransactions + 1, W_new) - _mathCache.Grad(_square, _numTransactions, _width);
        }

        // ReSharper disable once InconsistentNaming
        private bool IsUIDisMissing(UID uid)
        {
            return ((_occ[uid.Value] | 0) == 0);
        }
    }
}