using System;
using System.Collections.Generic;
using System.Linq;


namespace Clope
{
    internal class Clope
    {
        private DatabaseHandler _db;
        private List<Cluster> _clusterList;
        public List<int> TableClusters;
        private MathSupport mathSupport;


        /// <summary>
        /// Реализация алгоритма Clope
        /// </summary>
        /// <param name="r">коэффициент отталкивания</param>
        public void CPU_Clusterization()
        {
            Initialize();       //Фаза 1

            DisplayClusters();  //Вывод на экран результат работы после инициализации

            Iterate();          //Фаза 2

            DisplayClusters();  //Отобразим результат работы алгоритма
        }


        private void Initialize()
        {
            //// Фаза 1 – инициализация
            var iMaxProfitCluster = 0;
            Transaction transaction;
            _clusterList = new List<Cluster>();
            TableClusters = new List<int>();

            while (_db.TryReadNextTransaction(out transaction)) //прочитать из таблицы следующую транзакцию[t, -];
            {
                if (iMaxProfitCluster >= _clusterList.Count - 1)
                    _clusterList.Add(new Cluster(_db.GetObjectsCount(), ref mathSupport));  //Если последний кластер уже не пуст, добавим пустой кластер
                //положить t в существующий либо в новый кластер Ci, который дает максимум Profit(C, r);

                iMaxProfitCluster = Profit(transaction);         //Найдём номер кластера, дающий наибольший профит

                _clusterList[iMaxProfitCluster].AddTransaction(transaction);     //Добавим транзакцию в кластер
                TableClusters.Add(iMaxProfitCluster);                           //и номер кластера в список транзакций
            }
            if (_clusterList.Last().NumberTransactions == 0)                    //Если последний кластер пустой (а пустым может быть только последний кластер)
                _clusterList.RemoveAt(_clusterList.Count - 1);    //Удалим его
        }

        private void Iterate()
        {
            //// Фаза 2 – Итерация
            //int j;
            bool moved;
            Transaction transaction;
            //Повторять
            do
            {
                //Console.ReadKey();
                //перейти в начало таблицы;
                _db.Reset();
                moved = false;
                var j = 0;


                while (_db.TryReadNextTransaction(out transaction))  //читать[t, i];
                {
                    var iCurrentCluster = TableClusters[j];

                    //transaction = _db.TryReadNextTransaction();
                    //положить t в существующий либо в новый кластер Cj, который максимизирует Profit(C, r);
                    var iMaxProfitCluster = Profit(transaction, iCurrentCluster);
                    //если Ci<> Cj тогда
                    if (iMaxProfitCluster != iCurrentCluster)                             //Если профит даёт другой кластер
                    {
                        // записать[t, i];
                        _clusterList[iCurrentCluster].DelTransaction(transaction);       //Удалим транзакцию из старого кластера
                        _clusterList[iMaxProfitCluster].AddTransaction(transaction);     //Добавим транзакцию в кластер с максимумом профита
                        TableClusters[j] = iMaxProfitCluster;                           //Изменим номер кластера в список транзакций

                        moved = true;       //признак изменения таблицы
                    }
                    j++;
                }
                //DisplayClusters();
            } while (moved);

            //удалить все пустые кластеры;
            var i = 0;
            while (i < _clusterList.Count)
            {
                if (_clusterList[i].NumberTransactions == 0)        //Если нашли пустой кластер
                {
                    for (var j = 0; j < TableClusters.Count; j++)
                    {
                        if (TableClusters[j] > i)   //Уменьшим на 1 номера всех кластеров в таблице, больше пустого
                            TableClusters[j]--;

                    }
                    _clusterList.RemoveAt(i);        //Удалим кластер
                }
                else
                    i++;
            }
        }


        /// <summary>
        /// Установка базы данных, из которой будем брать транзакцию
        /// </summary>
        /// <param name="databaseHandler"></param>
        /// <param name="repulsion">Коэффициент отталкивания</param>
        public void SetParameters(DatabaseHandler databaseHandler, double repulsion)
        {
            mathSupport = new MathSupport(repulsion);
            _db = databaseHandler;
        }


        private void DisplayClusters()
        {
            var classes = _db.GetClassesIDs();
            int[] sum = new int[classes.Count];

            Console.Write("CLUSTER");
            for (int i = 0; i < classes.Count; i++)
            {
                Console.Write("\t{0}", classes[i].Name);
            }
            Console.WriteLine();
            for (int i = 0; i < _clusterList.Count; i++)
            {
                Console.Write("{0}", i + 1);
                for (int j = 0; j < classes.Count; j++)
                {
                    Console.Write("\t{0}", _clusterList[i][classes[j].NumberAttribute]);
                    sum[j] += _clusterList[i][classes[j].NumberAttribute];
                }
                Console.WriteLine();
            }
            Console.WriteLine("Total");
            for (int j = 0; j < classes.Count; j++)
                Console.Write("\t{0}", sum[j]);
            Console.WriteLine();
        }



        /// <summary>
        /// Функция поиска кластера, дающий набольший профит для транзакции
        /// </summary>
        /// <param name="transaction">транзакция</param>
        /// <param name="iCurrentCluster">номер кластера, в котором уже лежит транзакция</param>
        /// <returns>номер кластера</returns>
        private int Profit(Transaction transaction, int iCurrentCluster = -1)
        {
            double maxProfit; //Значение максимума функции DeltaAdd после пробега по существующим кластерам и попытке создать новый.

            int iMaxProfitCluster;
            if (iCurrentCluster >= 0) //Если транзакция уже лежит в каком то кластере, посчитаем профит от неё как текущий максимум
            {
                maxProfit = _clusterList[iCurrentCluster].DeltaDel(transaction);
                iMaxProfitCluster = iCurrentCluster;    //Начальное значение номера кластера с максимальным профитом
            }
            else
            {
                maxProfit = 0;          //Вызывающая функция следит за наличием пустых кластеров в списке при инициализации, так что смело устанавливаем начальное значение 0
                iMaxProfitCluster = 0;
            }

            //int iMaxProfitCluster = (iCurrentCluster >= 0) ? iCurrentCluster : 0;    //Начальное значение номера кластера с максимальным профитом

            for (var i = 0; i < _clusterList.Count; i++)
            {
                if (i == iCurrentCluster) continue;                 //Если наткнулись на кластер, в котором лежит транзакция, пропускаем подсчёт профита
                var profit = _clusterList[i].DeltaAdd(transaction);    //переменная для хранения результата функции DeltaAdd
                if (profit <= maxProfit) continue;
                iMaxProfitCluster = i;
                maxProfit = profit;
            }

            return iMaxProfitCluster;
        }
    }
}
