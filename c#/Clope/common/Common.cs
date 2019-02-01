using System;
using System.Collections;
using System.Collections.Generic;
namespace Clope.common
{
    //using object = System.Object;
    public class Transaction : List<UID> { }

    public class UID
    {
        private static int _generatorValue = 0;
        public UID()
        {
            Value = GenerateNew();
        }
        public int Value { get; }
        public override int GetHashCode() => (Value.GetHashCode());
        public override bool Equals(object obj) => obj is UID uid && this.Equals(uid);
        private bool Equals(UID uid) => (int.Equals(this.Value, uid.Value));
        private static int GenerateNew()
        {
            return _generatorValue++;
        }
    }

    public interface IDataSource<T> : IEnumerable
    {
    }

    public interface ITransactionStore : IDataSource<Transaction>
    {
        int Size { get; }
        void InitStore();
        Dictionary<object, UID> GetClassesIDs(int columnNumber);
    }
}