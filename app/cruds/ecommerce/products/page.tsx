import { Metadata } from 'next';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/app/components/toolbar';
import ProductList from './components/product-list';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Manage products',
};

export default async function Page() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarTitle>Products</ToolbarTitle>
        </ToolbarHeading>
        <ToolbarActions></ToolbarActions>
      </Toolbar>
      <ProductList />
    </>
  );
}
