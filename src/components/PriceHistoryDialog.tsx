import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Edit, Trash2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

interface UserPermissions {
  add_product: boolean;
  edit_product: boolean;
  delete_product: boolean;
  add_price_history: boolean;
  edit_price_history: boolean;
  delete_price_history: boolean;
}

interface PriceHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onPriceHistoryUpdated: () => void;
  isAdmin?: boolean;
  userPermissions?: UserPermissions;
}

const priceFormSchema = z.object({
  effdate: z.date({
    required_error: "A date is required.",
  }),
  unitprice: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Price must be a positive number"
    ),
});

const PriceHistoryDialog = ({
  open,
  onClose,
  product,
  onPriceHistoryUpdated,
  isAdmin = false,
  userPermissions = {
    add_product: false,
    edit_product: false,
    delete_product: false,
    add_price_history: false,
    edit_price_history: false,
    delete_price_history: false,
  }
}: PriceHistoryDialogProps) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceHistory | null>(null);
  const { toast } = useToast();

  const fetchPriceHistory = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pricehist")
        .select("*")
        .eq("prodcode", product.prodcode)
        .order("effdate", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setPriceHistory(data as PriceHistory[]);
      }
    } catch (error) {
      console.error("Error fetching price history:", error);
      toast({
        variant: "destructive",
        title: "Failed to load price history",
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && product) {
      fetchPriceHistory();
    }
  }, [open, product]);

  const addForm = useForm<z.infer<typeof priceFormSchema>>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      unitprice: "",
    },
  });

  const editForm = useForm<z.infer<typeof priceFormSchema>>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      unitprice: "",
    },
  });

  const handleAddNewPrice = async (values: z.infer<typeof priceFormSchema>) => {
    try {
      const { error } = await supabase.from("pricehist").insert({
        prodcode: product.prodcode,
        effdate: format(values.effdate, "yyyy-MM-dd"),
        unitprice: parseFloat(values.unitprice),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Price added",
        description: "New price has been added successfully",
      });
      
      setIsAddSheetOpen(false);
      addForm.reset();
      fetchPriceHistory();
      onPriceHistoryUpdated();
    } catch (error) {
      console.error("Error adding price:", error);
      toast({
        variant: "destructive",
        title: "Failed to add price",
        description: "Please try again later",
      });
    }
  };

  const handleEditPrice = async (values: z.infer<typeof priceFormSchema>) => {
    if (!selectedPrice) return;

    try {
      const { error } = await supabase
        .from("pricehist")
        .update({
          effdate: format(values.effdate, "yyyy-MM-dd"),
          unitprice: parseFloat(values.unitprice),
        })
        .eq("prodcode", selectedPrice.prodcode)
        .eq("effdate", selectedPrice.effdate);

      if (error) {
        throw error;
      }

      toast({
        title: "Price updated",
        description: "Price has been updated successfully",
      });
      
      setIsEditSheetOpen(false);
      editForm.reset();
      fetchPriceHistory();
      onPriceHistoryUpdated();
    } catch (error) {
      console.error("Error updating price:", error);
      toast({
        variant: "destructive",
        title: "Failed to update price",
        description: "Please try again later",
      });
    }
  };

  const handleDeletePrice = async () => {
    if (!selectedPrice) return;

    try {
      const { error } = await supabase
        .from("pricehist")
        .delete()
        .eq("prodcode", selectedPrice.prodcode)
        .eq("effdate", selectedPrice.effdate);

      if (error) {
        throw error;
      }

      toast({
        title: "Price deleted",
        description: "Price has been deleted successfully",
      });
      
      setDeleteDialogOpen(false);
      fetchPriceHistory();
      onPriceHistoryUpdated();
    } catch (error) {
      console.error("Error deleting price:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete price",
        description: "Please try again later",
      });
    }
  };

  const openEditSheet = (price: PriceHistory) => {
    setSelectedPrice(price);
    editForm.reset({
      effdate: new Date(price.effdate),
      unitprice: price.unitprice?.toString() || "",
    });
    setIsEditSheetOpen(true);
  };

  const openDeleteDialog = (price: PriceHistory) => {
    setSelectedPrice(price);
    setDeleteDialogOpen(true);
  };

  const openAddSheet = () => {
    addForm.reset({
      unitprice: "",
    });
    setIsAddSheetOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Price History</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="font-medium">Product Code</Label>
              <p>{product.prodcode}</p>
            </div>
            <div>
              <Label className="font-medium">Description</Label>
              <p>{product.description || "-"}</p>
            </div>
            <div>
              <Label className="font-medium">Unit</Label>
              <p>{product.unit || "-"}</p>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="flex justify-between items-center p-4">
              <h3 className="font-semibold">Price History Records</h3>
              {(isAdmin || userPermissions.add_price_history) && (
                <Button onClick={openAddSheet} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add New Price
                </Button>
              )}
            </div>
            
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Loading price history...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No price history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    priceHistory.map((price, index) => (
                      <TableRow key={`${price.prodcode}-${price.effdate}-${index}`}>
                        <TableCell>
                          {format(new Date(price.effdate), "yyyy-MMM-dd")}
                        </TableCell>
                        <TableCell>
                          ${price.unitprice !== null ? price.unitprice.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {(isAdmin || userPermissions.edit_price_history) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditSheet(price)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            )}
                            {(isAdmin || userPermissions.delete_price_history) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(price)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Price Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Price</SheetTitle>
          </SheetHeader>
          
          <div className="py-4">
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddNewPrice)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="effdate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Effective Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="unitprice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            $
                          </span>
                          <Input {...field} className="pl-6" placeholder="0.00" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <SheetFooter className="mt-4">
                  <Button type="submit">Save</Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Price Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Price</SheetTitle>
          </SheetHeader>
          
          <div className="py-4">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditPrice)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="effdate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Effective Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="unitprice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            $
                          </span>
                          <Input {...field} className="pl-6" placeholder="0.00" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <SheetFooter className="mt-4">
                  <Button type="submit">Update</Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the price history record from {" "}
              {selectedPrice && format(new Date(selectedPrice.effdate), "MMM d, yyyy")}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrice}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PriceHistoryDialog;
