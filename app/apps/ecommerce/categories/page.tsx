import { Metadata } from 'next';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/app/components/toolbar';
import CategoryList from './components/category-list';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Manage categories',
};

export default async function Page() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarTitle>Categories</ToolbarTitle>
        </ToolbarHeading>
        <ToolbarActions></ToolbarActions>
      </Toolbar>
      <CategoryList />
    </>
  );
}
