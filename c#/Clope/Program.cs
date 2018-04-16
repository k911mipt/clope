using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Clope
{
    static class Program
    {
        static void Main(string[] args)
        {

            
            var algo = new Clope();

            double repulsion = 2.7;
            int clusterColumnNumber = 0; //номер информативной колонки

            string databasePath = "D:\\Work\\Projects\\Repos\\Clope\\Mushroom_DataSet\\agaricus-lepiota.data";
            string outputName = "";

            #region commandline handle
            for (int i = 0; i < args.Length; i++)
            {
                switch (args[i])
                {
                    case "-d":
                        i++;
                        if (i < args.Length)
                            databasePath = args[i];
                        else
                            Console.WriteLine("Empty databaseHandler name!");
                        break;
                    case "-r":
                        i++;
                        if (i < args.Length)
                            repulsion = double.Parse(args[i]);
                        else
                            Console.WriteLine("Empty repulsion value!");
                        break;
                    case "-n":
                        i++;
                        if (i < args.Length)
                            clusterColumnNumber = int.Parse(args[i]);
                        else
                            Console.WriteLine("Empty repulsion value!");
                        break;
                    case "-o":
                        i++;
                        if (i < args.Length)
                            outputName = args[i];
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
            #endregion

            Stopwatch stopWatch = new Stopwatch();
            stopWatch.Start();

            var DB = new TextFileDatabaseHandler(clusterColumnNumber);
            DB.SetFile(databasePath);
            stopWatch.Stop();
            TimeSpan ts = stopWatch.Elapsed;
            string elapsedTime = $"{ts.Hours:00}:{ts.Minutes:00}:{ts.Seconds:00}.{ts.Milliseconds / 1:000}";
            Console.WriteLine("RunTime SetParameters" + elapsedTime);

            stopWatch.Restart();
            algo.SetParameters(DB,repulsion);
            algo.CPU_Clusterization();

            stopWatch.Stop();

            ts = stopWatch.Elapsed;


            if (outputName!="")
            {
                using (System.IO.StreamWriter file = new System.IO.StreamWriter(outputName))
                    foreach (int num in algo.TableClusters)
                        file.WriteLine(num.ToString());
            }
            DateTime start = DateTime.Now;
            elapsedTime = $"{ts.Hours:00}:{ts.Minutes:00}:{ts.Seconds:00}.{ts.Milliseconds / 1:000}";
            Console.WriteLine("RunTime Clope" + elapsedTime);

            Console.WriteLine("Press enter to continue.");
            Console.ReadLine();
        }

        static void PrintHelp()
        {
            Console.WriteLine("usage: Clope -d <database_file> -r <repulsion>");
            Console.WriteLine("[-o <output_file>]");
            Console.WriteLine();
            Console.WriteLine("Press any key to continue.");
            Console.ReadKey();
        }
    }
}
