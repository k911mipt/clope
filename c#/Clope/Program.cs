using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Clope.clope;
using Clope.common;
using Clope.db;

namespace Clope
{
    static class Program
    {
        private static string _databasePath;
        private static double _repulsion;
        private static int _clusterColumnNumber;
        private static string _outputFileName;

        private static readonly Stopwatch StopWatch = new Stopwatch();

        static void Main(string[] args)
        {
            SetDefaults();
            HandleCommandLineArguments(args);
            RunAlgoDemonstration();

            Console.WriteLine("Press enter to continue.");
            Console.ReadLine();
        }

        private static void RunAlgoDemonstration()
        {
            var fileSource = new FileDataSource(_databasePath);

            var ruleSet = new RuleSet<string>(s => s.Split(','), new[] { (object)'?' }, new[] { _clusterColumnNumber });
            var transactionStore = new TransactionStore<string>(fileSource, ruleSet);
            var clope = new clope.Clope(transactionStore, _repulsion);

            StartTimer();
            transactionStore.InitStore();
            StopTimerAndLogResult("Store initialization");

            StartTimer();
            var tableClusters = clope.Run();
            StopTimerAndLogResult("Algorithm job");

            ruleSet.Update(s => s.Split(','), new[] { (object)'?' }, new int[] { });
            var display = new Display(0, transactionStore, tableClusters);
            display.Out();


            if (_outputFileName == "") return;
            using (System.IO.StreamWriter file = new System.IO.StreamWriter(_outputFileName))
                foreach (int num in tableClusters)
                    file.WriteLine(num.ToString());
        }

        private static void HandleCommandLineArguments(IReadOnlyList<string> args)
        {
            for (var i = 0; i < args.Count; i++)
            {
                switch (args[i])
                {
                    case "-d":
                        i++;
                        if (i < args.Count)
                            _databasePath = args[i];
                        else
                            Console.WriteLine("Empty databaseHandler name!");
                        break;
                    case "-r":
                        i++;
                        if (i < args.Count)
                            _repulsion = double.Parse(args[i]);
                        else
                            Console.WriteLine("Empty repulsion value!");
                        break;
                    case "-n":
                        i++;
                        if (i < args.Count)
                            _clusterColumnNumber = int.Parse(args[i]);
                        else
                            Console.WriteLine("Empty repulsion value!");
                        break;
                    case "-o":
                        i++;
                        if (i < args.Count)
                            _outputFileName = args[i];
                        else
                            Console.WriteLine("Empty output file name!");
                        break;
                    case "-help":
                        PrintHelp();
                        return;
                    default:
                        Console.WriteLine("Uknkown argument: " + args[i]);
                        PrintHelp();
                        return;
                }
            }
        }

        private static void StartTimer()
        {
            StopWatch.Restart();
        }

        private static void StopTimerAndLogResult(string message)
        {
            var ts = StopWatch.Elapsed;
            var elapsedTime = $"{ts.Hours:00}:{ts.Minutes:00}:{ts.Seconds:00}.{ts.Milliseconds / 1:000}";
            Console.WriteLine(message + " lasted: " + elapsedTime);
        }

        private static void SetDefaults()
        {
            _repulsion = 2.7;
            _clusterColumnNumber = 0; //номер информативной колонки
            _databasePath = "..\\..\\..\\..\\Mushroom_DataSet\\agaricus-lepiota.data";
            _outputFileName = "";
        }

        private static void PrintHelp()
        {
            Console.WriteLine("usage: Clope -d <database_file> -r <repulsion>");
            Console.WriteLine("[-o <output_file>]");
            Console.WriteLine();
            Console.WriteLine("Press any key to continue.");
            Console.ReadKey();
        }
    }
}
