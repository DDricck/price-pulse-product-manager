
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  PieChart, 
  Tag, 
  Plus, 
  Search, 
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "@/components/ProductList";
import MainLayout from "@/components/MainLayout";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your products and their price history</p>
          </div>
          <Button onClick={() => console.log("Add new product")}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpRight size={16} className="mr-1" />
                <span>Increasing</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$89.45</div>
              <p className="text-xs text-muted-foreground mt-1">Based on all active products</p>
              <div className="mt-4 flex items-center text-sm text-red-600">
                <ArrowDownRight size={16} className="mr-1" />
                <span>-2.5% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Price Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">36</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpRight size={16} className="mr-1" />
                <span>+14% from previous week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">Across product catalog</p>
              <div className="mt-4 flex items-center text-sm">
                <Tag size={16} className="mr-1" />
                <span>Electronics is largest</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="price-changes">Recent Price Changes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 w-full sm:w-[240px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="all">
            <ProductList searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="price-changes">
            <Card>
              <CardHeader>
                <CardTitle>Recent Price Changes</CardTitle>
                <CardDescription>Track the latest price adjustments across your products</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Price change history will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Price Analytics</CardTitle>
                <CardDescription>Analyze price trends and patterns</CardDescription>
              </CardHeader>
              <CardContent className="flex space-x-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <BarChart size={24} />
                  <span>Price Trends</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <PieChart size={24} />
                  <span>Category Distribution</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
