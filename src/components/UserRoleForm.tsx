
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UserRoleFormProps {
  user: any;
  open: boolean;
  onClose: () => void;
  onRoleUpdated: () => void;
}

interface FormValues {
  role: string;
  edit_product: boolean;
  delete_product: boolean;
  add_product: boolean;
  edit_price_history: boolean;
  delete_price_history: boolean;
  add_price_history: boolean;
}

const UserRoleForm = ({ user, open, onClose, onRoleUpdated }: UserRoleFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      role: user?.role || "user",
      edit_product: user?.permissions?.edit_product || false,
      delete_product: user?.permissions?.delete_product || false,
      add_product: user?.permissions?.add_product || false,
      edit_price_history: user?.permissions?.edit_price_history || false,
      delete_price_history: user?.permissions?.delete_price_history || false,
      add_price_history: user?.permissions?.add_price_history || false,
    }
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Update role
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: user.id,
          role: data.role 
        });

      if (roleError) throw roleError;

      // Update permissions
      const { error: permissionsError } = await supabase
        .from("user_permissions")
        .upsert({
          user_id: user.id,
          edit_product: data.edit_product,
          delete_product: data.delete_product,
          add_product: data.add_product,
          edit_price_history: data.edit_price_history,
          delete_price_history: data.delete_price_history,
          add_price_history: data.add_price_history
        });
      
      if (permissionsError) throw permissionsError;

      toast({
        title: "User updated",
        description: "User role and permissions have been updated successfully",
      });

      onRoleUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error updating user",
        description: error.message || "Failed to update user role and permissions",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Role & Permissions</DialogTitle>
          <DialogDescription>
            Update role and permissions for {user?.email || "user"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>User Role</FormLabel>
                  <FormDescription>
                    The role determines the user's base level of access.
                  </FormDescription>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin">Admin</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user" id="user" />
                      <Label htmlFor="user">User</Label>
                    </div>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Product Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="add_product"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Add Products</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="edit_product"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Edit Products</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delete_product"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Delete Products</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <h4 className="text-sm font-medium">Price History Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="add_price_history"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Add Price History</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="edit_price_history"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Edit Price History</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delete_price_history"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Delete Price History</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleForm;
