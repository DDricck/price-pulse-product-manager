
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PriceHistory {
  prodcode: string;
  effdate: string;
  unitprice: number | null;
}

const PriceHistory = () => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const { data, error } = await supabase.from("pricehist").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          setPriceHistory(data as PriceHistory[]);
        }
      } catch (error) {
        console.error("Error fetching price history:", error);
        toast({
          variant: "destructive",
          title: "Failed to load price history",
          description: "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [toast]);

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Price History</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              <LineChart size={16} />
              <span className="font-medium">{priceHistory.length} Price Records</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historical Pricing Data</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Loading price history...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Unit Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No price history found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      priceHistory.map((record, index) => (
                        <TableRow key={`${record.prodcode}-${record.effdate}-${index}`}>
                          <TableCell className="font-medium">{record.prodcode}</TableCell>
                          <TableCell>{format(new Date(record.effdate), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            {record.unitprice !== null 
                              ? `$${record.unitprice.toFixed(2)}` 
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PriceHistory;
