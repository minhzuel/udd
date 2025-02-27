'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinners';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDismissDialog } from '@/app/components/confirm-dismiss-dialog';
import { EcommerceCategory } from '@/app/models/ecommerce';
import { CategorySchema, CategorySchemaType } from '../forms/category';

const CategoryEditDialog = ({
  open,
  closeDialog,
  category,
}: {
  open: boolean;
  closeDialog: () => void;
  category?: EcommerceCategory | null;
}) => {
  const queryClient = useQueryClient();

  // State to manage the confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Form initialization
  const form = useForm<CategorySchemaType>({
    resolver: zodResolver(CategorySchema),
    defaultValues: { name: '', slug: '', description: '' },
    mode: 'onSubmit',
  });

  // Reset form values when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description ?? '',
      });
    }
  }, [open, category, form]);

  // Mutation for creating/updating category
  const mutation = useMutation({
    mutationFn: async (values: CategorySchemaType) => {
      const isEdit = !!category?.id;
      const url = isEdit
        ? `/api/cruds/ecommerce/categories/${category.id}`
        : '/api/cruds/ecommerce/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      const message = category
        ? 'Category updated successfully'
        : 'Category added successfully';

      toast.custom(() => (
        <Alert variant="mono" icon="success">
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>{message}</AlertTitle>
        </Alert>
      ));

      queryClient.invalidateQueries({ queryKey: ['ecommerce-categories'] });
      closeDialog();
    },
    onError: (error: Error) => {
      toast.custom(() => (
        <Alert variant="mono" icon="destructive">
          <AlertIcon>
            <RiErrorWarningFill />
          </AlertIcon>
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      ));
    },
  });

  // Derive the loading state from the mutation status
  const isLoading = mutation.status === 'pending';

  // Handle form submission
  const handleSubmit = (values: CategorySchemaType) => {
    mutation.mutate(values);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (form.formState.isDirty) {
      setShowConfirmDialog(true);
    } else {
      closeDialog();
    }
  };

  // Handle confirmation to discard changes
  const handleConfirmDiscard = () => {
    form.reset();
    setShowConfirmDialog(false);
    closeDialog();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent close={false}>
          <DialogHeader>
            <DialogTitle>
              {category ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g: computers-tech"
                        {...field}
                        disabled={!!category}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      A unique key for the category, cannot be edited after
                      creation.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description must be maximum 500 characters long."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !form.formState.isDirty}
                >
                  {isLoading && <Spinner className="animate-spin" />}
                  {category ? 'Update Category' : 'Add Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ConfirmDismissDialog
        open={showConfirmDialog}
        onOpenChange={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
};

export default CategoryEditDialog;
