'use client';

import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';

const DirectionProvider = ({ children }: { children: React.ReactNode }) => {
  return <RadixDirectionProvider dir="ltr">{children}</RadixDirectionProvider>;
};

export { DirectionProvider };
