
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  permissions: UserPermissions;
}

interface UserPermissions {
  id: string;
  user_id: string;
  edit_product: boolean;
  delete_product: boolean;
  add_product: boolean;
  edit_price_history: boolean;
  delete_price_history: boolean;
  add_price_history: boolean;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    id: "",
    user_id: "",
    edit_product: false,
    delete_product: false,
    add_product: false,
    edit_price_history: false,
    delete_price_history: false,
    add_price_history: false,
  });
  
  const navigate = useNavigate();

  // Check if current user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
        
        const { data: roleData, error: roleError } = await supabase.rpc("is_admin");
        
        if (roleError) {
          console.error("Error checking admin status:", roleError);
          setIsAdmin(false);
          navigate("/dashboard");
          return;
        }
        
        setIsAdmin(roleData);
        
        if (!roleData) {
          // Redirect non-admin users
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            duration: 5000,
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error:", error);
        navigate("/dashboard");
      }
    };

    checkUserRole();
  }, [navigate]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        setLoading(true);
        
        // Get all users from Supabase Auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw authError;
        }

        // Get user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("*");
          
        if (rolesError) {
          throw rolesError;
        }

        // Get user permissions
        const { data: permissionsData, error: permissionsError } = await supabase
          .from("user_permissions")
          .select("*");
          
        if (permissionsError) {
          throw permissionsError;
        }

        // Map and combine the data
        const mappedUsers = authUsers.users.map(user => {
          const userRole = rolesData.find(r => r.user_id === user.id);
          const userPermission = permissionsData.find(p => p.user_id === user.id) || {
            id: "",
            user_id: user.id,
            edit_product: false,
            delete_product: false,
            add_product: false,
            edit_price_history: false,
            delete_price_history: false,
            add_price_history: false,
          };
          
          return {
            id: user.id,
            email: user.email || "",
            role: userRole?.role || "user",
            status: user.banned ? "deleted" : "active",
            permissions: userPermission
          };
        });

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleOpenPermissions = (user: User) => {
    setSelectedUser(user);
    setUserPermissions(user.permissions);
    setPermissionsDialogOpen(true);
  };

  const handlePermissionChange = (permission: keyof UserPermissions, value: boolean) => {
    setUserPermissions({
      ...userPermissions,
      [permission]: value,
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      // Check if permissions record already exists
      if (userPermissions.id) {
        // Update existing permissions
        const { error } = await supabase
          .from("user_permissions")
          .update({
            edit_product: userPermissions.edit_product,
            delete_product: userPermissions.delete_product,
            add_product: userPermissions.add_product,
            edit_price_history: userPermissions.edit_price_history,
            delete_price_history: userPermissions.delete_price_history,
            add_price_history: userPermissions.add_price_history,
          })
          .eq("id", userPermissions.id);
          
        if (error) throw error;
      } else {
        // Create new permissions record
        const { error } = await supabase
          .from("user_permissions")
          .insert({
            user_id: selectedUser.id,
            edit_product: userPermissions.edit_product,
            delete_product: userPermissions.delete_product,
            add_product: userPermissions.add_product,
            edit_price_history: userPermissions.edit_price_history,
            delete_price_history: userPermissions.delete_price_history,
            add_price_history: userPermissions.add_price_history,
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `Permissions updated for ${selectedUser.email}`,
      });
      
      // Refresh the users list
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            permissions: userPermissions,
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setPermissionsDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "deleted" : "active";
      
      // Update user's banned status in Auth
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { banned: newStatus === "deleted" }
      );
      
      if (error) throw error;
      
      // Update the local state
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status: newStatus,
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      });
      
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      // Check if role record exists
      const { data: existingRole, error: fetchError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", existingRole.id);
          
        if (error) throw error;
      } else {
        // Create new role record
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
          
        if (error) throw error;
      }
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            role: newRole,
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      
    } catch (error) {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Users</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading users data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableCaption>List of all users in the system</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className={user.status === "deleted" ? "bg-red-50" : ""}
                  >
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <select 
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === "active" ? "default" : "destructive"}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenPermissions(user)}
                      >
                        Manage Permissions
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant={user.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id, user.status)}
                      >
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Permissions Dialog */}
        <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Permissions</DialogTitle>
              <DialogDescription>
                Set permissions for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-product"
                  checked={userPermissions.edit_product} 
                  onCheckedChange={(checked) => 
                    handlePermissionChange("edit_product", checked === true)
                  } 
                />
                <label htmlFor="edit-product">Edit Product</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="delete-product"
                  checked={userPermissions.delete_product} 
                  onCheckedChange={(checked) => 
                    handlePermissionChange("delete_product", checked === true)
                  }  
                />
                <label htmlFor="delete-product">Delete Product</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="add-product"
                  checked={userPermissions.add_product} 
                  onCheckedChange={(checked) => 
                    handlePermissionChange("add_product", checked === true)
                  }  
                />
                <label htmlFor="add-product">Add Product</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-price-history"
                  checked={userPermissions.edit_price_history} 
                  onCheckedChange={(checked) => 
                    handlePermissionChange("edit_price_history", checked === true)
                  }  
                />
                <label htmlFor="edit-price-history">Edit Price History</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="delete-price-history"
                  checked={userPermissions.delete_price_history} 
                  onCheckedChange={(checked) => 
                    handlePermissionChange("delete_price_history", checked === true)
                  }  
                />
                <label htmlFor="delete-price-history">Delete Price History</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="add-price-history"
                  checked={userPermissions.add_price_history} 
                  onCheckedChange={(checked) => 
                    handlePermissionChange("add_price_history", checked === true)
                  }  
                />
                <label htmlFor="add-price-history">Add Price History</label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleSavePermissions}
              >
                Save Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ManageUsers;
