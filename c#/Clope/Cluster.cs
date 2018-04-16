using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Clope
{
    internal class Cluster
    {
        private int _width,                  //ширина кластера
                    _square;
        private readonly int[] _occ;                  //таблица количества объектов в кластере
        public int NumberTransactions { get; private set; }  //количество транзакций в кластере
        private readonly MathSupport _mathSupport;
        private double R => _mathSupport.Repulsion;
        public int this[int i] => _occ[i];


        /// <summary>
        /// Конструктор класса
        /// </summary>
        /// <param name="capacity">максимальное количество различных объектов. Число формируется в классе TextFileDatabaseHandler, prop CountObjects</param>
        /// <param name="mathSupport">Воспомогательный класс с кэшированием вычисленных значений для функции Grad</param>
        public Cluster(int capacity, ref MathSupport mathSupport)
        {
            this._mathSupport = mathSupport;
            //mathSupport.repulsion = 5;
            _width = 0;
            _square = 0;
            NumberTransactions = 0;
            _occ = new int[capacity];
        }



        /// <summary>
        /// Добавление транзакции
        /// </summary>
        /// <param name="transaction">транзакция</param>
        public void AddTransaction(Transaction transaction)
        {
            _square += transaction.ElementKeyCount;
            NumberTransactions++;
            for (var i = 0; i < transaction.ElementKeyCount; i++)
            {
                if (_occ[transaction[i]] == 0)
                    _width++;
                _occ[transaction[i]]++;
            }

        }



        /// <summary>
        /// Удаление транзакции
        /// </summary>
        /// <param name="transaction">транзакция</param>
        public void DelTransaction(Transaction transaction)
        {
            _square -= transaction.ElementKeyCount;
            NumberTransactions--;
            for (var i = 0; i < transaction.ElementKeyCount; i++)
            {
                _occ[transaction[i]]--;
                if (_occ[transaction[i]] == 0)
                    _width--;
            }
        }


        /// <summary>
        /// Вычисление прироста профита в случае добавления транзакции
        /// </summary>
        /// <param name="transaction">транзакция</param>
        /// <returns>изменение профита</returns>
        public double DeltaAdd(Transaction transaction)
        {
            var S_new = _square + transaction.ElementKeyCount;
            var W_new = _width;
            for (var i = 0; i < transaction.ElementKeyCount; i++)
                //if (_occ.TryGetValue(transaction[i], out var _))
                if (_occ[transaction[i]] == 0)
                    W_new++;
            if (NumberTransactions > 0)
                return Grad(S_new, NumberTransactions + 1, W_new) - Grad(_square, NumberTransactions, _width);
            return Grad(S_new, NumberTransactions + 1, W_new);

        }



        /// <summary>
        /// Вычисление уменьшения профита в случае удаления транзакции
        /// </summary>
        /// <param name="transaction"></param>
        /// <returns>изменение профита</returns>
        public double DeltaDel(Transaction transaction)
        {
            int S_new = _square - transaction.ElementKeyCount;
            int W_new = _width;
            for (int i = 0; i < transaction.ElementKeyCount; i++)
                if (_occ[transaction[i]] == 1)
                    W_new--;

            if (NumberTransactions < 1)
                Console.WriteLine("Попытка удаления транзакции из пустого кластера, проверьте исходный код!");

            if ((W_new != 0) & (NumberTransactions == 1))
                return Grad(_square, NumberTransactions, _width) - Grad(S_new, NumberTransactions - 1, W_new);

            return Grad(_square, NumberTransactions, _width);
        }

        private double Grad(int S, int N, int W)
        {
            //return S * N / Math.Pow(W, R);
            return S * N / _mathSupport.GetPreCalculatedWpowR(W);
        }
    }
}
