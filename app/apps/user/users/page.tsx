import { Metadata } from 'next';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/app/components/toolbar';
import UserList from './components/user-list';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage users.',
};

export default async function UsersPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarTitle>Users</ToolbarTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>User Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </ToolbarHeading>
        <ToolbarActions></ToolbarActions>
      </Toolbar>
      <UserList />
    </>
  );
}
