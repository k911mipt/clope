using System;
using System.Collections.Generic;

namespace Clope.common
{
    public class Display
    {
        private ITransactionStore dataSource;
        private List<int> tableClusters;
        private Dictionary<object, UID> classesIDs;
        private List<Dictionary<UID, int>> clusterOccurences;
        private int columnNumber;

        public Display(int columnNumber, ITransactionStore dataSource, List<int> tableClusters)
        {
            this.dataSource = dataSource;
            this.tableClusters = tableClusters;
            this.columnNumber = columnNumber;

            classesIDs = this.dataSource.GetClassesIDs(columnNumber);
            clusterOccurences = new List<Dictionary<UID, int>>();
        }
        public void Out() {
            GroupBy();

            var sum = new int[classesIDs.Count];
            var tempstr = "CLUSTER";
            foreach (var pair in classesIDs) {
                tempstr = tempstr + "\t" + pair.Key;
            }

            Console.WriteLine(tempstr);
            for (var i = 0; i< this.clusterOccurences.Count; i++) {
                tempstr = (i + 1).ToString();
                var j = 0;
                foreach (var pair in classesIDs)
                {
                    if (clusterOccurences[i].TryGetValue(pair.Value, out var val))
                    {
                        tempstr += "\t" + val;
                        sum[j] += val;
                        j++;
                    }
                }
                //for (var j = 0; j< this.classesIDs.Count; j++)
                //    if (clusterOccurences[i].TryGetValue(classesIDs[j].Value, out var val))
                //    {
                //        tempstr += "\t" + val;
                //        sum[j] += val;
                //    }
                Console.WriteLine(tempstr);
            }
            Console.WriteLine("Total");
            tempstr = "";
            for (var j = 0; j< this.classesIDs.Count; j++) {
                tempstr += "\t" + sum[j];
            }
            Console.WriteLine(tempstr);
        }

        private void GroupBy()
        {
            var rowNumber = 0;
            foreach (Transaction transaction in dataSource) {
                var uid = transaction[columnNumber];
                var clusterNumber = tableClusters[rowNumber++];
                if (clusterNumber >= clusterOccurences.Count)
                    for (var i = clusterOccurences.Count; i <= clusterNumber; i++) {
                        clusterOccurences.Add(new Dictionary<UID, int>());
                        foreach (var pair in classesIDs)
                            clusterOccurences[i].Add(pair.Value, 0);
                    }

                if (clusterOccurences[clusterNumber].TryGetValue(uid, out var val))
                    clusterOccurences[clusterNumber][uid] = val + 1;
            }
        }
    }
}