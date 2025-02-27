'use client';

import { useMemo, useState } from 'react';
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
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeDot, BadgeProps } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { comingSoonToast } from '@/app/components/coming-soon-toast';
import {
  EcommerceProduct,
  EcommerceProductStatus,
} from '@/app/models/ecommerce';
import { useCategorySelectQuery } from '../../categories/hooks/use-category-select-query';
import {
  getProductStatusProps,
  ProductStatusProps,
} from '../constants/product';

const ProductList = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>('all');

  // Role select query
  const { data: categoryList } = useCategorySelectQuery();

  // Fetch users from the server API
  const fetchProducts = async ({
    pageIndex,
    pageSize,
    sorting,
    searchQuery,
    selectedCategory,
    selectedStatus,
  }: DataGridApiFetchParams & {
    selectedCategory: string | null;
    selectedStatus: string | null;
  }): Promise<DataGridApiResponse<EcommerceProduct>> => {
    const sortField = sorting?.[0]?.id || '';
    const sortDirection = sorting?.[0]?.desc ? 'desc' : 'asc';

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
      ...(sortField ? { sort: sortField, dir: sortDirection } : {}),
      ...(searchQuery ? { query: searchQuery } : {}),
      ...(selectedCategory && selectedCategory !== 'all'
        ? { roleId: selectedCategory }
        : {}),
      ...(selectedStatus && selectedStatus !== 'all'
        ? { status: selectedStatus }
        : {}),
    });

    const response = await fetch(
      `/api/cruds/ecommerce/products?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products.');
    }

    return response.json();
  };

  // Users query
  const { data, isLoading } = useQuery({
    queryKey: [
      'products',
      pagination,
      sorting,
      searchQuery,
      selectedCategory,
      selectedStatus,
    ],
    queryFn: () =>
      fetchProducts({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        searchQuery,
        selectedCategory,
        selectedStatus,
      }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const handleCategorySelection = (roleId: string) => {
    setSelectedCategory(roleId);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleStatusSelection = (status: string) => {
    setSelectedStatus(status);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleRowClick = () => {
    comingSoonToast();
  };

  const columns = useMemo<ColumnDef<EcommerceProduct>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Product"
            column={column}
            visibility={true}
          />
        ),
        cell: ({ row }) => {
          const product = row.original;
          const thumbnail = product.thumbnail || null;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                {thumbnail && (
                  <AvatarImage
                    className="border border-border rounded-lg"
                    src={thumbnail}
                    alt={product.name}
                  />
                )}
              </Avatar>
              <div className="space-y-px">
                <div className="font-medium text-sm">{product.name}</div>
              </div>
            </div>
          );
        },
        size: 300,
        meta: {
          headerTitle: 'Product',
          skeleton: (
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ),
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'sku',
        id: 'sku',
        header: ({ column }) => (
          <DataGridColumnHeader title="SKU" column={column} />
        ),
        cell: ({ row }) => {
          const sku = row.original.sku;
          if (!sku) return '-';
          return sku;
        },
        meta: {
          headertitle: 'SKU',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'category_name',
        id: 'category_name',
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: ({ row }) => {
          const category = row.original.category;
          if (!category) return '-';

          return (
            <Badge variant="secondary" appearance="outline">
              {category.name}
            </Badge>
          );
        },
        size: 150,
        meta: {
          headerTitle: 'Category',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => {
          const statusProps = getProductStatusProps(
            info.getValue() as EcommerceProductStatus,
          );
          const variant = statusProps.variant as keyof BadgeProps['variant'];

          return (
            <Badge variant={variant} appearance="ghost">
              <BadgeDot />
              {statusProps.label}
            </Badge>
          );
        },
        size: 150,
        meta: {
          headertitle: 'Status',
          skeleton: <Skeleton className="w-14 h-7" />,
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'createdAt',
        id: 'createdAt',
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        cell: (info) => formatDate(new Date(info.getValue() as string)),
        meta: {
          headertitle: 'Joined',
          skeleton: <Skeleton className="w-20 h-7" />,
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'actions',
        header: '',
        cell: () => (
          <ChevronRight className="text-muted-foreground/70 size-3.5" />
        ),
        size: 50,
        meta: {
          headerClassName: 'w-0',
          skeleton: <Skeleton className="size-4" />,
        },
        enableSorting: false,
        enableResizing: false,
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
    getRowId: (row: EcommerceProduct) => row.id,
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
      <CardHeader className="flex-col flex-wrap sm:flex-row items-end items-stretch sm:items-center py-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search users"
              value={inputValue}
              size="sm"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
              className="ps-9 w-full sm:40 md:w-64"
            />
            {searchQuery.length > 0 && (
              <Button
                mode="icon"
                variant="ghost"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </Button>
            )}
          </div>
          <Select
            disabled={isLoading}
            onValueChange={handleCategorySelection}
            value={selectedCategory || 'all'}
            defaultValue="all"
          >
            <SelectTrigger size="sm" className="w-full sm:w-36">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categoryList?.map((role: EcommerceProduct) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            disabled={isLoading}
            onValueChange={handleStatusSelection}
            value={selectedStatus || 'all'}
            defaultValue="all"
          >
            <SelectTrigger size="sm" className="w-full sm:w-36">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {Object.entries(ProductStatusProps).map(([status, { label }]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end">
          <Button
            disabled={isLoading}
            size="sm"
            onClick={() => {
              //redirect('/products/new');
              comingSoonToast();
            }}
          >
            <Plus />
            Add Product
          </Button>
        </div>
      </CardHeader>
    );
  };

  return (
    <DataGrid
      table={table}
      recordCount={data?.pagination.total || 0}
      isLoading={isLoading}
      onRowClick={handleRowClick}
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
  );
};

export default ProductList;
