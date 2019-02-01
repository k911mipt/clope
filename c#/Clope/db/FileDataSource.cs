using System;
using System.Collections;
using System.IO;
using Clope.common;

namespace Clope.db
{
    public class FileDataSource : IDataSource<string>
    {
        private readonly string _filepath;
        private StreamReader _file;

        public FileDataSource(string filepath)
        {
            _filepath = filepath;
        }

        public IEnumerator GetEnumerator()
        {
            if (!Reset()) yield break;
            while (!_file.EndOfStream)
            {
                var line = _file.ReadLine();
                yield return line;
            }
        }
        private bool Reset()
        {
            try
            {
                _file?.Dispose();
                _file = new StreamReader(_filepath);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
            return true;
        }
    }
}