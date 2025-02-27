'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Search, X } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import {
  DataGrid,
  DataGridApiFetchParams,
  DataGridApiResponse,
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { EcommerceCategory } from '@/app/models/ecommerce';
import { User } from '@/app/models/user';
import { CategoryActionsCell } from './category-actions-cell';
import CategoryEditDialog from './category-edit-dialog';
import { CategoryStatusCell } from './category-status-cell';

const CategoryList = () => {
  // Dialog state management
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // List state management
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  // Query state management
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories from the server API
  const fetchCategories = async ({
    pageIndex,
    pageSize,
    sorting,
    searchQuery,
  }: DataGridApiFetchParams): Promise<
    DataGridApiResponse<EcommerceCategory>
  > => {
    const sortField = sorting?.[0]?.id || 'createdAt';
    const sortDirection = sorting?.[0]?.desc ? 'desc' : 'asc';

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
      ...(sortField ? { sort: sortField, dir: sortDirection } : {}),
      ...(searchQuery ? { query: searchQuery } : {}),
    });

    const response = await fetch(
      `/api/cruds/ecommerce/categories?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        'Oops! Something didn’t go as planned. Please try again in a moment.',
      );
    }

    return response.json();
  };

  // Categories query
  const { data, isLoading } = useQuery({
    queryKey: ['ecommerce-categories', pagination, sorting, searchQuery],
    queryFn: () =>
      fetchCategories({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        searchQuery,
      }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Column definitions
  const columns = useMemo<ColumnDef<EcommerceCategory>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Name"
            column={column}
            visibility={true}
          />
        ),
        cell: (info) => {
          const value = info.getValue() as string;
          return <span className="font-medium">{value}</span>;
        },
        size: 200,
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerTitle: 'Name',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
      },
      {
        accessorKey: 'slug',
        id: 'slug',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Slug"
            column={column}
            visibility={true}
          />
        ),
        cell: (info) => {
          const value = info.getValue() as string;

          return <Badge appearance="stroke">{value}</Badge>;
        },
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: 'w-56',
          skeleton: <Skeleton className="w-14 h-7" />,
        },
      },
      {
        accessorKey: 'productCount',
        id: 'productCount',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Products"
            column={column}
            visibility={true}
          />
        ),
        cell: (info) => {
          const value = info.getValue() as number;

          if (value > 0) {
            return (
              <Badge variant="secondary">
                <span className="opacity-70">Stock:</span>
                {value}
              </Badge>
            );
          } else {
            return (
              <Badge variant="secondary" className="opacity-60">
                No stock
              </Badge>
            );
          }
        },
        size: 100,
        enableSorting: false,
        enableHiding: true,
        meta: {
          headerTitle: 'Products',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
      },
      {
        accessorKey: 'createdBy_name',
        id: 'createdBy_name',
        header: ({ column }) => (
          <DataGridColumnHeader title="Created by" column={column} />
        ),
        cell: ({ row }) => {
          const user = row.original.createdByUser as User;
          const avatarUrl = user?.avatar || null;
          const initials = getInitials(user.name || user.email, 1);

          return (
            <Link
              href={`/user/users/${user.id}`}
              className="group inline-flex items-center p-1 rounded-full gap-1.5 bg-muted/40 border border-border"
            >
              <Avatar className="size-5">
                {avatarUrl && (
                  <AvatarImage src={avatarUrl} alt={user.name || ''} />
                )}
                <AvatarFallback className="bg-warning text-warning-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-xs group-hover:text-primary pe-1">
                {user.name || user.email}
              </span>
            </Link>
          );
        },
        size: 150,
        meta: {
          headerTitle: 'Created By',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            column={column}
            visibility={true}
          />
        ),
        cell: ({ row }) => <CategoryStatusCell row={row} />,
        size: 125,
        meta: {
          headerTitle: 'Status',
          skeleton: <Skeleton className="w-14 h-7" />,
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <CategoryActionsCell row={row} />,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        meta: {
          skeleton: <Skeleton className="size-5" />,
        },
      },
    ],
    [],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string),
  );

  const table = useReactTable({
    columns,
    data: data?.data || [],
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize),
    getRowId: (row: EcommerceCategory) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const DataGridToolbar = () => {
    const [inputValue, setInputValue] = useState(searchQuery);

    const handleSearch = () => {
      setSearchQuery(inputValue);
      setPagination({ ...pagination, pageIndex: 0 });
    };

    return (
      <CardHeader className="py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search..."
              value={inputValue}
              size="sm"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading && true}
              className="ps-9 w-36 sm:w-64"
            />
            {searchQuery.length > 0 && (
              <Button
                mode="icon"
                size="xs"
                variant="dim"
                className="absolute size-6 end-1.5 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            disabled={isLoading && true}
            size="sm"
            onClick={() => {
              setAddDialogOpen(true);
            }}
          >
            <Plus />
            Add Category
          </Button>
        </div>
      </CardHeader>
    );
  };

  return (
    <>
      <DataGrid
        table={table}
        recordCount={data?.pagination.total || 0}
        isLoading={isLoading}
        tableLayout={{
          columnsResizable: true,
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
        tableClassNames={{
          edgeCell: 'px-5',
        }}
      >
        <Card>
          <DataGridToolbar />
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <CategoryEditDialog
        open={addDialogOpen}
        closeDialog={() => setAddDialogOpen(false)}
      />
    </>
  );
};

export default CategoryList;
