
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, Package, Users, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        navigate("/login");
        return;
      }
      
      setUserData(data.session.user);
      setIsLoading(false);
    };
    
    checkUser();
  }, [navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const statCards = [
    { title: "Total Products", value: "0", icon: Package, color: "bg-blue-500" },
    { title: "Price Changes", value: "0", icon: TrendingUp, color: "bg-green-500" },
    { title: "Categories", value: "0", icon: Users, color: "bg-purple-500" },
    { title: "Revenue Impact", value: "$0", icon: DollarSign, color: "bg-amber-500" },
  ];

  const recentActivity = [
    { id: 1, action: "Welcome to PricePulse! Get started by adding your first product.", date: new Date().toLocaleDateString() },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {userData?.email?.split('@')[0] || 'User'}</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>Average price trends of your products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-center p-6">
                  <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No price data yet</h3>
                  <p className="text-gray-500 mt-1">Add products to start tracking price changes</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
