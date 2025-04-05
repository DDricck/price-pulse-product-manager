
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
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  prodcode: string;
  description: string | null;
  unit: string | null;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("product").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          setProducts(data as Product[]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Failed to load products",
          description: "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              <Package size={16} />
              <span className="font-medium">{products.length} Products</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.prodcode}>
                          <TableCell className="font-medium">{product.prodcode}</TableCell>
                          <TableCell>{product.description || "-"}</TableCell>
                          <TableCell>{product.unit || "-"}</TableCell>
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

export default Products;
