import { useState } from 'react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { Row } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { toast } from 'sonner';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EcommerceCategory } from '@/app/models/ecommerce';
import CategoryDeleteDialog from './category-delete-dialog';
import CategoryEditDialog from './category-edit-dialog';

export const CategoryActionsCell = ({
  row,
}: {
  row: Row<EcommerceCategory>;
}) => {
  // Form state management
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<EcommerceCategory | null>(
    null,
  );
  const [deleteCategory, setDeleteCategory] =
    useState<EcommerceCategory | null>(null);

  const { copyToClipboard } = useCopyToClipboard();
  const handleCopyId = () => {
    copyToClipboard(row.original.id);

    toast.custom((t) => (
      <Alert
        variant="mono"
        icon="success"
        close={false}
        onClose={() => toast.dismiss(t)}
      >
        <AlertIcon>
          <RiCheckboxCircleFill />
        </AlertIcon>
        <AlertTitle>Category id copied to clipboard</AlertTitle>
      </Alert>
    ));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-7 w-7" mode="icon" variant="ghost">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
          <DropdownMenuItem
            onClick={() => {
              setEditCategory(row.original);
              setEditDialogOpen(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setDeleteCategory(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryEditDialog
        open={editDialogOpen}
        closeDialog={() => setEditDialogOpen(false)}
        category={editCategory}
      />

      {deleteCategory && (
        <CategoryDeleteDialog
          open={deleteDialogOpen}
          closeDialog={() => setDeleteDialogOpen(false)}
          category={deleteCategory}
        />
      )}
    </>
  );
};
