
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppUser, UserRole } from "@/types/user-types";

export const useUserManagement = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const inviteUser = async (email: string, firstName: string, lastName: string, role: string) => {
    try {
      setLoading(true);
      
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      });
      
      if (error) throw error;
      
      if (data && role === 'admin') {
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
        description: `Invitation email sent to ${email}`,
      });
      
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
      
      return true;
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Failed to invite user",
        description: error.message || "Please try again later",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true);
      
      const currentRoleRecord = userRoles.find((role) => role.user_id === userId);
      
      if (newRole === 'admin') {
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
      
      // Refresh roles
      const { data: updatedRoles } = await supabase
        .from('user_roles')
        .select('*');
      if (updatedRoles) setUserRoles(updatedRoles);
      
      return true;
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: error.message || "Please try again later",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      // Delete user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      toast({
        title: "User deleted",
        description: `User account has been removed`,
      });
      
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
      
      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete user",
        description: error.message || "Please try again later",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    userRoles,
    loading,
    getUserRole,
    inviteUser,
    updateUserRole,
    deleteUser
  };
};
