using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Clope
{
    internal struct TransactionElement
    {
        public object Name { get; } //object под возможную реализацию вытягивания данных с бд. предполагается что операция сравнения чисел будет работать быстрее строк
        public Type ValueType => Name?.GetType();
        public int NumberAttribute { get; }
        public int UniqueNumber { get; }

        public TransactionElement(object name, int numberAttribute)
        {
            Name = name;
            NumberAttribute = numberAttribute;
            UniqueNumber = -1;
        }
        public TransactionElement(object name, int numberAttribute, int uniqueNumber)
        {
            Name = name;
            NumberAttribute = numberAttribute;
            UniqueNumber = uniqueNumber;
        }
        public override int GetHashCode() => (Name != null ? Name.GetHashCode() : 0) ^ NumberAttribute;
        public override bool Equals(object obj) => obj is TransactionElement element && this.Equals(element);
        private bool Equals(TransactionElement obj) => (int.Equals(this.NumberAttribute, obj.NumberAttribute) && (object.Equals(this.Name, obj.Name)));
    }

    interface IDatabaseHandler
    {
        /// <summary>
        /// Число уникальных объектов в наборе данных
        /// </summary>
        int GetObjectsCount();
        /// <summary>
        /// Получить следующую транзакцию из набора данных
        /// </summary>
        /// <returns>Набор уникальных номеров объектов транзакции</returns>
        bool TryReadNextTransaction(out Transaction transaction);
        /// <summary>
        /// Получить список уникальных номеров объектов, соответствующих полям классов(если задано)
        /// </summary>
        /// <returns>список уникальных номеров объектов классов</returns>
        List<TransactionElement> GetClassesIDs();
        /// <summary>
        /// Подключиться к базе данных
        /// </summary>
        /// <returns></returns>
        bool Connect();
        /// <summary>
        /// Сдвинуть указатель на начало данных
        /// </summary>
        /// <returns></returns>
        bool Reset();
    }


    abstract class DatabaseHandler : IDatabaseHandler
    {
        protected readonly Dictionary<TransactionElement, int> UniqueObjects;  //Словарь отображения множества уникальных объектов таблицы на множество целых чисел
        private readonly HashSet<object> _nullElements;
        private readonly HashSet<int> _unusedFieldNumbers;
        private readonly HashSet<int> _numbersOfColumnsWithClassesNames;
        private List<TransactionElement> _classesIDs;
        protected bool IsEndOfData;                      //признак конца файла/данных
        protected DatabaseHandler()
        {
            IsEndOfData = true;
            UniqueObjects = new Dictionary<TransactionElement, int>();
            _classesIDs= new List<TransactionElement>();
            _nullElements = new HashSet<object> { null, "?" };
            _numbersOfColumnsWithClassesNames = new HashSet<int> {0};

        }

        public int GetObjectsCount() => UniqueObjects.Count;                            //Количество уникальных объектов

        public abstract bool TryReadNextTransaction(out Transaction transaction);           //Выдать следующую транзакцию на обработку
        public abstract bool TryReadNextNewTransaction(out Transaction transaction);           //Выдать следующую транзакцию на обработку
        public abstract bool Connect();                                                 //Подключиться к базе данных
        public abstract bool Reset();                                                   //Сдвинуть указатель на начало данных


        protected Transaction FormTransaction(object[] elements)
        {
            var transaction = new Transaction(elements.Length);

            for (var i = 0; i < elements.Length; i++)
            {

                if (_nullElements.Contains(elements[i])) continue;
                if (UniqueObjects.TryGetValue(new TransactionElement(elements[i], i), out var elementKey)) //попытаемся найти номер объекта в списке уникальных объектов
                    transaction.AddElementKey(elementKey);                   //Добавим id объекта в транзакцию
                else
                    throw new Exception("Объект не найден в списке. Проверьте, не изменился ли файл за время работы программы!");
            }
            return transaction;
        }
        protected Transaction FormNewTransaction(object[] elements)
        {
            var transaction = new Transaction(elements.Length);

            for (var i = 0; i < elements.Length; i++)
            {

                if (_nullElements.Contains(elements[i])) continue;       //Если в списке объектов, указанных для пропуска, прочтём следующий
                if (_numbersOfColumnsWithClassesNames.Contains(i))
                    _classesIDs.Add(new TransactionElement(elements[i], UniqueObjects.Count));
                if (UniqueObjects.TryGetValue(new TransactionElement(elements[i], i), out var elementKey)) //попытаемся найти номер объекта в списке уникальных объектов
                    transaction.AddElementKey(elementKey);                   //Добавим id объекта в транзакцию
                else
                    UniqueObjects.Add(new TransactionElement(elements[i], i, UniqueObjects.Count), UniqueObjects.Count); //Добавляем новый объект
            }
            return transaction;
        }
        public virtual List<TransactionElement> GetClassesIDs() => _classesIDs;

        protected void AddNullElement(object element) => _nullElements.Add(element);

    }
}
