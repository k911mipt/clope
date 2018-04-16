using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Resources;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace Clope
{


    internal class TextFileDatabaseHandler : DatabaseHandler, IDisposable
    {
        private string filename;                        //имя файла
        private string textTransaction;                 //строка транзакции
        private StreamReader file;                      //файл
        
        private int informationColumnNumber;

        public TextFileDatabaseHandler():base()
        {
        }

        /// <summary>
        /// Конструктор
        /// </summary>
        public TextFileDatabaseHandler(int informationColumnNumber):base()
        {
            //DatabaseHandler();
            this.informationColumnNumber = informationColumnNumber;
        }


        public override bool Connect()
        {
            return true;
        }
        /// <summary>
        /// Функция переноса чтения на начало файла
        /// </summary>
        public override bool Reset()
        {
            try
            {
                file?.Dispose();
                file = new StreamReader(filename);
                IsEndOfData = file.EndOfStream;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
            return true;
        }




        /// <summary>
        /// Задание пути к файлу, из которого будем читать информацию
        /// </summary>
        /// <param name="path">путь к файлу</param>
        public void SetFile(string path)
        {
            filename = path;
            Reset();                    //откроем файл
            FullFillObjectsTable();     //Заполним множество уникальных объектов
            Reset();
        }


        /// <summary>
        /// Функция получения следующей транзакции в виде списка номеров уникальных объектов
        /// Написана под конкретную реализацию Mushroom DataSet
        /// 
        /// </summary>
        /// <returns>список id объектов транзакции</returns>
        private Transaction GetNextTransaction()
        {
            string[] substrings = textTransaction.Split(',');       //Получим набор подстрок - идентификаторов объектов
            return FormTransaction((object[]) substrings);
        }

        public override bool TryReadNextTransaction(out Transaction transaction)
        //public override bool TryReadNextTransaction(out Transaction transaction)
        {
            IsEndOfData = ((textTransaction = file.ReadLine()) == null);    //Cчитывание новой строки
            if (IsEndOfData)
            {
                transaction = new Transaction();
                return false;
            }
            transaction = GetNextTransaction();
            return true;
        }

        /// <summary>
        /// Функция получения следующей транзакции в виде списка номеров уникальных объектов
        /// Написана под конкретную реализацию Mushroom DataSet
        /// 
        /// </summary>
        /// <returns>список id объектов транзакции</returns>
        private Transaction GetNextNewTransaction()
        {
            
            string[] substrings = textTransaction.Split(',');       //Получим набор подстрок - идентификаторов объектов
            return FormNewTransaction((object[])substrings);
        }
        public override bool TryReadNextNewTransaction(out Transaction transaction)
        {
            IsEndOfData = ((textTransaction = file.ReadLine()) == null);    //Cчитывание новой строки
            if (IsEndOfData)
            {
                transaction = new Transaction();
                return false;
            }
            transaction = GetNextNewTransaction();
            return true;
        }


        /// <summary>
        /// Функция получения списка номеров первых атрибутов, классов транзакций
        /// </summary>
        public override List<TransactionElement> GetClassesIDs()
        {
            var ids = new List<TransactionElement>();
            foreach (var transactionElement in UniqueObjects.Keys)
                if (IsClusterAttribute(transactionElement.NumberAttribute))
                //if (transactionElement.NumberAttribute==numberClusterAttribute)
                    ids.Add(new TransactionElement(transactionElement.Name, transactionElement.UniqueNumber));
            return ids;
        }
        public bool IsClusterAttribute(int number) => (number == 0);



        /// <summary>
        /// Функция заполнения таблицы уникальных объектов базы
        /// </summary>
        private void FullFillObjectsTable()
        {
            //int j = 0;
            //IsEndOfData = ((textTransaction = file.ReadLine()) == null);    //Cчитывание новой строки
            //while (!IsEndOfData)
            Console.WriteLine();
            while ((textTransaction = file.ReadLine()) != null)
            {
                object[] substrings = textTransaction.Split(',');   //Получим набор подстрок - идентификаторов объектов
                for (int i = 0; i < substrings.Length; i++)
                {
                    
                    if (substrings[i].Equals("?")) continue;
                    //Если объект не пропущен, проверим, есть ли он в списке уникальных объектов
                    if (!UniqueObjects.TryGetValue(new TransactionElement(substrings[i], i),out var _))
                        UniqueObjects.Add(new TransactionElement(substrings[i], i, UniqueObjects.Count), UniqueObjects.Count); //Добавляем новый объект
                    //if (!substrings[i].Equals("?") && !uniqueObjects.ContainsKey(new TransactionElement(substrings[i], i)))
                    //    uniqueObjects.Add(new TransactionElement(substrings[i], i, uniqueObjects.Count), uniqueObjects.Count); //Добавляем новый объект
                    //Console.WriteLine($"\t{i}");

                }
                IsEndOfData = ((textTransaction = file.ReadLine()) == null);
            }
        }


        public void Dispose()
        {
            //file?.Close();
            file.Dispose();
        }


    }
}
