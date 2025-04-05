
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, Package, Users, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Types for our data
interface Product {
  prodcode: string;
  description: string | null;
  unit: string | null;
}

interface PriceHistory {
  prodcode: string;
  effdate: string;
  unitprice: number | null;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        navigate("/login");
        return;
      }
      
      setUserData(data.session.user);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select('*')
        .order('prodcode');
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }
      
      // Fetch price history
      const { data: priceData, error: priceError } = await supabase
        .from('pricehist')
        .select('*')
        .order('effdate', { ascending: false });
      
      if (priceError) {
        console.error('Error fetching price history:', priceError);
      } else {
        setPriceHistory(priceData || []);
      }
      
      setIsLoading(false);
    };
    
    checkUser();
  }, [navigate]);

  // Prepare data for the price history chart
  const chartData = priceHistory.reduce((acc: Record<string, any>[], item) => {
    // Format date to be readable
    const date = new Date(item.effdate).toLocaleDateString();
    
    // Find if this date already exists in our accumulator
    let dateEntry = acc.find(entry => entry.date === date);
    
    if (!dateEntry) {
      // Create new entry if this date doesn't exist
      dateEntry = { date };
      acc.push(dateEntry);
    }
    
    // Add or update price for this product on this date
    dateEntry[item.prodcode] = item.unitprice;
    
    return acc;
  }, []);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Get user's display name
  const getUserDisplayName = () => {
    if (!userData) return "User";
    
    const firstName = userData.user_metadata?.first_name || '';
    const lastName = userData.user_metadata?.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else {
      return userData.email?.split('@')[0] || "User";
    }
  };

  // Count statistics
  const productCount = products.length;
  const categoryCount = [...new Set(products.map(p => p.unit))].filter(Boolean).length;
  const priceChangeCount = priceHistory.length;
  const averagePrice = priceHistory.length > 0 
    ? (priceHistory.reduce((sum, item) => sum + (item.unitprice || 0), 0) / priceHistory.length).toFixed(2) 
    : "0.00";

  const statCards = [
    { title: "Total Products", value: productCount.toString(), icon: Package, color: "bg-blue-500" },
    { title: "Price Changes", value: priceChangeCount.toString(), icon: TrendingUp, color: "bg-green-500" },
    { title: "Categories", value: categoryCount.toString(), icon: Users, color: "bg-purple-500" },
    { title: "Avg. Price", value: `$${averagePrice}`, icon: DollarSign, color: "bg-amber-500" },
  ];

  const recentActivity = priceHistory.length > 0
    ? priceHistory.slice(0, 3).map((price, index) => {
        const productName = products.find(p => p.prodcode === price.prodcode)?.description || price.prodcode;
        return {
          id: index + 1,
          action: `Price updated for ${productName} to $${price.unitprice}`,
          date: new Date(price.effdate).toLocaleDateString()
        };
      })
    : [{ id: 1, action: "Welcome to PricePulse! Get started by adding your first product.", date: new Date().toLocaleDateString() }];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {getUserDisplayName()}</h1>
            <p className="text-gray-600">Here's what's happening with your products today</p>
          </div>
          <Button 
            onClick={() => navigate("/products/new")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add New Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-white`}>
                    <stat.icon size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Products Table */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Your product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="overflow-auto max-h-80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.slice(0, 5).map((product) => (
                        <TableRow key={product.prodcode}>
                          <TableCell className="font-medium">{product.prodcode}</TableCell>
                          <TableCell>{product.description || 'N/A'}</TableCell>
                          <TableCell>{product.unit || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {products.length > 5 && (
                    <div className="mt-3 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate("/products")}
                      >
                        View All Products
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-center p-6">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
                    <p className="text-gray-500 mt-1">Add your first product to get started</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price History Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>Historical price trends</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      {products.slice(0, 3).map((product, index) => (
                        <Line 
                          key={product.prodcode}
                          type="monotone" 
                          dataKey={product.prodcode} 
                          name={product.description || product.prodcode}
                          stroke={['#3b82f6', '#10b981', '#8b5cf6'][index % 3]} 
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-center p-6">
                    <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No price data yet</h3>
                    <p className="text-gray-500 mt-1">Add products to start tracking price changes</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest product activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price History Table */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Latest Price Updates</CardTitle>
              <CardDescription>Recent changes to product prices</CardDescription>
            </CardHeader>
            <CardContent>
              {priceHistory.length > 0 ? (
                <div className="overflow-auto max-h-80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceHistory.slice(0, 5).map((price, index) => {
                        const productName = products.find(p => p.prodcode === price.prodcode)?.description || price.prodcode;
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{productName}</TableCell>
                            <TableCell>{new Date(price.effdate).toLocaleDateString()}</TableCell>
                            <TableCell>${price.unitprice?.toFixed(2) || '0.00'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-center p-6">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No price updates yet</h3>
                    <p className="text-gray-500 mt-1">Price changes will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to help you get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/products/new")}
              >
                <Package className="h-8 w-8 text-blue-600" />
                <span>Add New Product</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/categories")}
              >
                <Users className="h-8 w-8 text-purple-600" />
                <span>Manage Categories</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/price-history")}
              >
                <BarChart3 className="h-8 w-8 text-green-600" />
                <span>View Price Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
