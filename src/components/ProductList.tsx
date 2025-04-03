
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, ArrowUpRight, ArrowDownRight, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for the product list
const mockProducts = [
  {
    id: "1",
    name: "Smartphone X Pro",
    category: "Electronics",
    currentPrice: 899.99,
    previousPrice: 949.99,
    sku: "ELEC-SP-001",
    lastUpdated: "2023-09-15",
  },
  {
    id: "2",
    name: "Wireless Headphones",
    category: "Audio",
    currentPrice: 129.99,
    previousPrice: 99.99,
    sku: "AUDIO-WH-002",
    lastUpdated: "2023-09-10",
  },
  {
    id: "3",
    name: "Ultra HD Monitor 27\"",
    category: "Computers",
    currentPrice: 349.99,
    previousPrice: 349.99,
    sku: "COMP-MON-003",
    lastUpdated: "2023-09-05",
  },
  {
    id: "4",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    currentPrice: 189.99,
    previousPrice: 219.99,
    sku: "FURN-CH-004",
    lastUpdated: "2023-09-12",
  },
  {
    id: "5",
    name: "Professional Camera Kit",
    category: "Photography",
    currentPrice: 1299.99,
    previousPrice: 1199.99,
    sku: "PHOTO-CAM-005",
    lastUpdated: "2023-09-08",
  },
];

interface ProductListProps {
  searchQuery: string;
}

const ProductList = ({ searchQuery }: ProductListProps) => {
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriceChangeElement = (current: number, previous: number) => {
    if (current === previous) {
      return <span className="text-gray-500">Unchanged</span>;
    }
    
    const percentageChange = ((current - previous) / previous) * 100;
    const isIncrease = current > previous;
    
    return (
      <div className={`flex items-center ${isIncrease ? "text-red-500" : "text-green-500"}`}>
        {isIncrease ? (
          <ArrowUpRight className="mr-1 h-4 w-4" />
        ) : (
          <ArrowDownRight className="mr-1 h-4 w-4" />
        )}
        {Math.abs(percentageChange).toFixed(1)}%
      </div>
    );
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Price Change</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <Link to={`/products/${product.id}`} className="hover:underline">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.sku}
                </TableCell>
                <TableCell>${product.currentPrice.toFixed(2)}</TableCell>
                <TableCell>
                  {getPriceChangeElement(product.currentPrice, product.previousPrice)}
                </TableCell>
                <TableCell>{product.lastUpdated}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/products/${product.id}/price-history`}>
                        <LineChart className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No products found matching your search
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductList;
