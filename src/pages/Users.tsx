
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, MoreVertical, RotateCw, UserPlus, CheckCircle, XCircle } from "lucide-react";
import UserRoleForm from "@/components/UserRoleForm";
import { useNavigate } from "react-router-dom";
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

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase.rpc("is_admin");
      
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have permission to access this page",
        });
        navigate("/dashboard");
        return;
      }
      
      setIsAdmin(true);
      fetchUsers();
    };
    
    checkAdmin();
  }, [navigate, toast]);

  const fetchUsers = async () => {
    try {
      // Fetch users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      if (!authUsers?.users) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Fetch user roles from user_roles table
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch user permissions from user_permissions table
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("*");

      if (permissionsError) throw permissionsError;

      // Combine data
      const combinedData = authUsers.users.map((user) => {
        const role = rolesData?.find((r) => r.user_id === user.id);
        const permissions = permissionsData?.find((p) => p.user_id === user.id);
        
        return {
          ...user,
          role: role?.role || "user",
          permissions: permissions || {}
        };
      });

      setUsers(combinedData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: any) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleRoleDialogClose = () => {
    setShowRoleDialog(false);
    setSelectedUser(null);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setShowResetDialog(true);
  };

  const handleConfirmReset = async () => {
    if (!selectedUser) return;
    
    try {
      // Request password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset link sent",
        description: `A password reset link has been sent to ${selectedUser.email}`,
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Failed to reset password",
        description: error.message || "Please try again later",
      });
    } finally {
      setShowResetDialog(false);
      setSelectedUser(null);
    }
  };

  if (!isAdmin) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <RotateCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={() => {}} // For future invite user feature
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-2">
                                {user.user_metadata?.first_name?.[0] || user.email[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.user_metadata?.first_name && user.user_metadata?.last_name
                                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                                    : user.email.split("@")[0]}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${user.role === 'admin' ? 'bg-blue-600' : 'bg-green-600'}`}></div>
                              <span className="capitalize">{user.role}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.permissions?.add_product && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Add Product
                                </span>
                              )}
                              {user.permissions?.edit_product && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Edit Product
                                </span>
                              )}
                              {user.permissions?.add_price_history && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Add Price
                                </span>
                              )}
                              {/* Show more indicator if user has more than 3 permissions */}
                              {(user.permissions?.delete_product || 
                                 user.permissions?.edit_price_history || 
                                 user.permissions?.delete_price_history) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +more
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditRole(user)} className="cursor-pointer">
                                  <Shield className="mr-2 h-4 w-4" />
                                  Edit Role & Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(user)} className="cursor-pointer">
                                  <RotateCw className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Edit Role Dialog */}
      {selectedUser && (
        <UserRoleForm
          user={selectedUser}
          open={showRoleDialog}
          onClose={handleRoleDialogClose}
          onRoleUpdated={fetchUsers}
        />
      )}

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset link to {selectedUser?.email}.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset}>
              Send Reset Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Users;
