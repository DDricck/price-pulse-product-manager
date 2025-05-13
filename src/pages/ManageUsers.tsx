
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Shield, MoreHorizontal, UserPlus, Pencil, Trash2, Users } from "lucide-react";
import { formatDistance } from "date-fns";
import { User } from '@supabase/supabase-js';

// Use type augmentation for our application-specific user data
type AppUser = User & {
  email: string; // Make email required for our app
  created_at: string;
  last_sign_in_at: string | null;
};

type UserRole = {
  id: string;
  user_id: string;
  user_admin: string;
  created_at: string;
  updated_at: string;
};

const ManageUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState("user");
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        // Check if current user is admin
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
        
        if (isAdminError || !isAdminData) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have permission to access this page.",
          });
          return;
        }
        
        // Fetch users
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
          console.error("Error fetching users:", usersError);
          throw usersError;
        }
        
        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('*');
          
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          throw rolesError;
        }
        
        // Ensure all users have email property and cast them to AppUser
        const usersWithEmail = (usersData?.users || []).map(user => ({
          ...user,
          email: user.email || '',  // Ensure email is never undefined
        })) as AppUser[];
        
        setUsers(usersWithEmail);
        setUserRoles(rolesData || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Failed to load users",
          description: "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndRoles();
  }, [toast]);

  const getUserRole = (userId: string) => {
    const userRole = userRoles.find((role) => role.user_id === userId);
    return userRole ? userRole.user_admin : 'user';
  };

  const handleInviteUser = async () => {
    try {
      setLoading(true);
      
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
        data: {
          first_name: inviteFirstName,
          last_name: inviteLastName,
        }
      });
      
      if (error) throw error;
      
      if (data && inviteRole === 'admin') {
        // If admin role, add to user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            user_admin: 'admin'
          });
          
        if (roleError) throw roleError;
      }
      
      toast({
        title: "User invited",
        description: `Invitation email sent to ${inviteEmail}`,
      });
      
      setInviteDialogOpen(false);
      
      // Refresh users list
      const { data: updatedUsers } = await supabase.auth.admin.listUsers();
      if (updatedUsers) {
        // Ensure all users have email property
        const usersWithEmail = updatedUsers.users.map(user => ({
          ...user,
          email: user.email || '',
        })) as AppUser[];
        
        setUsers(usersWithEmail);
      }
      
      // Refresh roles
      const { data: updatedRoles } = await supabase
        .from('user_roles')
        .select('*');
      if (updatedRoles) setUserRoles(updatedRoles);
      
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Failed to invite user",
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
      resetInviteForm();
    }
  };

  const handleUpdateUserRole = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const userId = currentUser.id;
      const currentRoleRecord = userRoles.find((role) => role.user_id === userId);
      
      if (currentUserRole === 'admin') {
        // User should be admin
        if (currentRoleRecord) {
          // Update existing record to admin
          await supabase
            .from('user_roles')
            .update({ user_admin: 'admin' })
            .eq('user_id', userId);
        } else {
          // Insert new admin record
          await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              user_admin: 'admin'
            });
        }
      } else {
        // User should be regular user, remove from user_roles if they exist there
        if (currentRoleRecord) {
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);
        }
      }
      
      toast({
        title: "User updated",
        description: `User role updated successfully`,
      });
      
      setEditUserDialogOpen(false);
      
      // Refresh roles
      const { data: updatedRoles } = await supabase
        .from('user_roles')
        .select('*');
      if (updatedRoles) setUserRoles(updatedRoles);
      
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Delete user
      const { error } = await supabase.auth.admin.deleteUser(
        currentUser.id
      );
      
      if (error) throw error;
      
      toast({
        title: "User deleted",
        description: `User account has been removed`,
      });
      
      setDeleteConfirmDialogOpen(false);
      
      // Refresh users list
      const { data: updatedUsers } = await supabase.auth.admin.listUsers();
      if (updatedUsers) {
        // Ensure all users have email property
        const usersWithEmail = updatedUsers.users.map(user => ({
          ...user,
          email: user.email || '',
        })) as AppUser[];
        
        setUsers(usersWithEmail);
      }
      
      // User roles should be automatically cascaded due to foreign key constraint
      const { data: updatedRoles } = await supabase
        .from('user_roles')
        .select('*');
      if (updatedRoles) setUserRoles(updatedRoles);
      
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete user",
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
      setCurrentUser(null);
    }
  };

  const openEditUserDialog = (user: User) => {
    // Convert the regular User to AppUser by ensuring email is not undefined
    const appUser: AppUser = {
      ...user,
      email: user.email || ''
    };
    setCurrentUser(appUser);
    setCurrentUserRole(getUserRole(user.id));
    setEditUserDialogOpen(true);
  };

  const openDeleteConfirmDialog = (user: User) => {
    // Convert the regular User to AppUser by ensuring email is not undefined
    const appUser: AppUser = {
      ...user,
      email: user.email || ''
    };
    setCurrentUser(appUser);
    setDeleteConfirmDialogOpen(true);
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteFirstName("");
    setInviteLastName("");
    setInviteRole("user");
  };

  // If not admin, show not authorized
  if (!isAdmin && !loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
              <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-500">Manage user accounts and permissions</p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              Users
            </CardTitle>
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
                      <TableHead>Created</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium">
                              {user.user_metadata?.first_name || ''} {user.user_metadata?.last_name || ''}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              getUserRole(user.id) === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              <Shield className="mr-1 h-3 w-3" />
                              {getUserRole(user.id) === 'admin' ? 'Admin' : 'User'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDistance(new Date(user.created_at), new Date(), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at 
                              ? formatDistance(new Date(user.last_sign_in_at), new Date(), { addSuffix: true })
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openEditUserDialog(user)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => openDeleteConfirmDialog(user)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
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

        {/* Invite User Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new user.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) => setInviteRole(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={!inviteEmail}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role and permissions for this user.
              </DialogDescription>
            </DialogHeader>
            {currentUser && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="font-medium">{currentUser.email}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={currentUserRole}
                    onValueChange={(value) => setCurrentUserRole(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUserRole}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the user account.
              </DialogDescription>
            </DialogHeader>
            {currentUser && (
              <div className="py-4">
                <p>
                  Are you sure you want to delete the account for <strong>{currentUser.email}</strong>?
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ManageUsers;
