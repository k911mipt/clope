using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Clope
{
    internal struct Transaction
    {
        //private List<int> items = new List<int>();    //список id объектов
        private readonly int[] _elementKeys; //список id объектов
        public int ElementKeyCount { get; private set; }  //количество объектов


        public Transaction(int capacity)
        {
            _elementKeys = new int[capacity];
            ElementKeyCount = 0;
        }

        public int this[int index] => _elementKeys[index];

        public void AddElementKey(int idObject) => _elementKeys[ElementKeyCount++] = idObject;        //добавление идентификатора объекта
    }
}
