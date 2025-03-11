import { Metadata } from 'next';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/app/components/toolbar';
import LogList from './components/log-list';

export const metadata: Metadata = {
  title: 'Logs',
  description: 'Logs',
};

export default async function ActivityLogsPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarTitle>Logs</ToolbarTitle>
        </ToolbarHeading>
        <ToolbarActions></ToolbarActions>
      </Toolbar>
      <LogList />
    </>
  );
}
