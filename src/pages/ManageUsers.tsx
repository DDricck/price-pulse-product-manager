
import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserManagement } from "@/hooks/useUserManagement";
import UserTable from "@/components/users/UserTable";
import InviteUserDialog from "@/components/users/InviteUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import { AppUser } from "@/types/user-types";

const ManageUsers = () => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState("user");
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { 
    users, 
    userRoles,
    loading: usersLoading, 
    getUserRole, 
    inviteUser,
    updateUserRole,
    deleteUser
  } = useUserManagement();

  const loading = authLoading || usersLoading;

  const handleInviteUser = async (email: string, firstName: string, lastName: string, role: string) => {
    const success = await inviteUser(email, firstName, lastName, role);
    if (success) {
      setInviteDialogOpen(false);
    }
  };

  const handleUpdateUserRole = async () => {
    if (!currentUser) return;
    
    const success = await updateUserRole(currentUser.id, currentUserRole);
    if (success) {
      setEditUserDialogOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    const success = await deleteUser(currentUser.id);
    if (success) {
      setDeleteConfirmDialogOpen(false);
      setCurrentUser(null);
    }
  };

  const openEditUserDialog = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentUserRole(getUserRole(user.id));
    setEditUserDialogOpen(true);
  };

  const openDeleteConfirmDialog = (user: AppUser) => {
    setCurrentUser(user);
    setDeleteConfirmDialogOpen(true);
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
              <UserTable 
                users={users}
                userRoles={userRoles}
                getUserRole={getUserRole}
                onEditUser={openEditUserDialog}
                onDeleteUser={openDeleteConfirmDialog}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>

        <InviteUserDialog 
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onInvite={handleInviteUser}
          loading={loading}
        />

        <EditUserDialog 
          open={editUserDialogOpen}
          onOpenChange={setEditUserDialogOpen}
          onUpdate={handleUpdateUserRole}
          user={currentUser}
          userRole={currentUserRole}
          onUserRoleChange={setCurrentUserRole}
        />

        <DeleteUserDialog 
          open={deleteConfirmDialogOpen}
          onOpenChange={setDeleteConfirmDialogOpen}
          onDelete={handleDeleteUser}
          user={currentUser}
        />
      </div>
    </MainLayout>
  );
};

export default ManageUsers;
