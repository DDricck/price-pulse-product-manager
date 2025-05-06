
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
import { Package, RotateCw, Archive, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PriceHistoryDialog from "@/components/PriceHistoryDialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Product {
  prodcode: string;
  description: string | null;
  unit: string | null;
  status: string;
  stamp: string | null;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeletedProducts, setShowDeletedProducts] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'delete' | 'restore';
    product: Product | null;
  }>({ open: false, type: 'delete', product: null });
  const [userPermissions, setUserPermissions] = useState({
    add_product: false,
    edit_product: false,
    delete_product: false,
    add_price_history: false,
    edit_price_history: false,
    delete_price_history: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      // Check if user is admin
      const { data: isAdminData, error: isAdminError } = await supabase.rpc("is_admin");
      
      if (!isAdminError && isAdminData) {
        setIsAdmin(true);
        setUserPermissions({
          add_product: true,
          edit_product: true,
          delete_product: true,
          add_price_history: true,
          edit_price_history: true,
          delete_price_history: true,
        });
      } else {
        // Fetch specific permissions
        const { data, error } = await supabase.from("user_permissions").select("*").single();
        if (!error && data) {
          setUserPermissions({
            add_product: data.add_product || false,
            edit_product: data.edit_product || false,
            delete_product: data.delete_product || false,
            add_price_history: data.add_price_history || false,
            edit_price_history: data.edit_price_history || false,
            delete_price_history: data.delete_price_history || false,
          });
        }
      }
      
      fetchProducts();
    };

    fetchUserPermissions();
  }, []);

  const fetchProducts = async () => {
    try {
      let query = supabase.from("product").select("*");
      
      // If not an admin or not showing deleted products, only show active products
      if (!isAdmin || !showDeletedProducts) {
        query = query.eq("status", "active");
      }
      
      const { data, error } = await query.order("prodcode");

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

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
    setShowPriceHistory(true);
  };

  const handleCloseDialog = () => {
    setShowPriceHistory(false);
  };

  const handlePriceHistoryUpdated = () => {
    toast({
      title: "Price history updated",
      description: "The price history has been updated successfully",
    });
  };

  const handleDeleteProduct = (product: Product) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      product: product
    });
  };

  const handleRestoreProduct = (product: Product) => {
    setConfirmDialog({
      open: true,
      type: 'restore',
      product: product
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.product) return;
    
    const product = confirmDialog.product;
    const isDelete = confirmDialog.type === 'delete';
    const currentUser = (await supabase.auth.getUser()).data.user;
    const userName = currentUser?.user_metadata?.first_name 
      ? `${currentUser.user_metadata.first_name} ${currentUser.user_metadata.last_name || ''}`
      : currentUser?.email?.split('@')[0] || 'User';
    
    const timestamp = new Date().toLocaleString();
    const stampValue = `${userName} - ${timestamp}`;
    
    try {
      const { error } = await supabase
        .from("product")
        .update({
          status: isDelete ? 'deleted' : 'active',
          stamp: stampValue
        })
        .eq("prodcode", product.prodcode);
      
      if (error) throw error;
      
      toast({
        title: isDelete ? "Product deleted" : "Product restored",
        description: isDelete 
          ? `${product.description || product.prodcode} has been deleted`
          : `${product.description || product.prodcode} has been restored`,
      });
      
      fetchProducts();
    } catch (error: any) {
      console.error(`Error ${isDelete ? 'deleting' : 'restoring'} product:`, error);
      toast({
        variant: "destructive",
        title: `Failed to ${isDelete ? 'delete' : 'restore'} product`,
        description: error.message || "Please try again later",
      });
    } finally {
      setConfirmDialog({ open: false, type: 'delete', product: null });
    }
  };

  const toggleDeletedProducts = () => {
    setShowDeletedProducts(!showDeletedProducts);
  };

  useEffect(() => {
    // Refetch products when showDeletedProducts changes
    fetchProducts();
  }, [showDeletedProducts]);

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
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDeletedProducts}
                className={showDeletedProducts ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
              >
                {showDeletedProducts ? (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Showing Deleted
                  </>
                ) : (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Show Deleted
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                      {isAdmin && <TableHead>Status</TableHead>}
                      {isAdmin && <TableHead>Stamp</TableHead>}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 4} className="h-24 text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow 
                          key={product.prodcode} 
                          className={`${product.status === "deleted" ? "bg-gray-50" : "hover:bg-muted/50"}`}
                        >
                          <TableCell 
                            className="font-medium"
                            onClick={() => product.status !== "deleted" && handleRowClick(product)}
                          >
                            {product.prodcode}
                          </TableCell>
                          <TableCell onClick={() => product.status !== "deleted" && handleRowClick(product)}>
                            {product.description || "-"}
                          </TableCell>
                          <TableCell onClick={() => product.status !== "deleted" && handleRowClick(product)}>
                            {product.unit || "-"}
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              {product.status === "deleted" ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  Deleted
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                          )}
                          {isAdmin && (
                            <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                              {product.stamp || "-"}
                            </TableCell>
                          )}
                          <TableCell>
                            {product.status === "deleted" ? (
                              isAdmin && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRestoreProduct(product)}
                                  className="text-green-600"
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Restore
                                </Button>
                              )
                            ) : (
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRowClick(product)}
                                >
                                  View Price History
                                </Button>
                                {userPermissions.delete_product && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product)}
                                    className="text-red-600"
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            )}
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
        
        {selectedProduct && (
          <PriceHistoryDialog
            open={showPriceHistory}
            onClose={handleCloseDialog}
            product={selectedProduct}
            onPriceHistoryUpdated={handlePriceHistoryUpdated}
            isAdmin={isAdmin}
            userPermissions={userPermissions}
          />
        )}

        {/* Confirm Delete/Restore Dialog */}
        <AlertDialog 
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.type === 'delete' ? 'Delete Product' : 'Restore Product'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.type === 'delete'
                  ? `Are you sure you want to delete ${confirmDialog.product?.description || confirmDialog.product?.prodcode}? 
                     This will only hide the product from regular users and can be restored later.`
                  : `Are you sure you want to restore ${confirmDialog.product?.description || confirmDialog.product?.prodcode}? 
                     This will make the product visible to all users again.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmAction}
                className={confirmDialog.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {confirmDialog.type === 'delete' ? 'Delete' : 'Restore'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Products;
