export interface NavItem {
  title: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];
}

export interface SiteConfig {
  name: string;
  url: string;
  ogImage: string;
  description: string;
  links: {
    privacy: string;
    twitter: string;
    github: string;
    suggestions: string;
  };
  nav: NavItem[];
}

export const siteConfig = {
  name: 'CrudHunt',
  url: 'https://crudhunt.com',
  ogImage: 'https://crudhunt.com/og.jpg',
  description:
    'Copy-and-paste UI components & CRUD modules powered by React, Next.js and styled with Tailwind.',
  links: {
    privacy: '/privacy-policy',
    twitter: 'https://x.com/crudhunt',
    github: 'https://github.com/keenthemes/crudhunt',
    suggestions:
      'https://github.com/keenthemes/crudhunt/discussions/categories/suggestions',
  },
  nav: [
    {
      title: 'User',
      children: [
        {
          title: 'Users',
          href: '/cruds/user/users',
        },
        {
          title: 'Roles',
          href: '/cruds/user/roles',
        },
        {
          title: 'Permissions',
          href: '/cruds/user/permissions',
        },
        {
          title: 'Account',
          href: '/cruds/user/account',
        },
      ],
    },
    {
      title: 'System',
      children: [
        {
          title: 'Settings',
          href: '/cruds/system/settings',
        },
        {
          title: 'Logs',
          href: '/cruds/system/logs',
        },
      ],
    },
    {
      title: 'eCommerce',
      children: [
        {
          title: 'Categories',
          href: '/cruds/ecommerce/categories',
        },
        {
          title: 'Products',
          href: '/cruds/ecommerce/products',
        },
      ],
    },
    {
      title: 'Components',
      href: 'https://crudhunt.com/components',
      external: true,
    },
    {
      title: 'Boilerplates',
      href: 'https://keenthemes.com/shoplit',
      external: true,
    },
    {
      title: 'Docs',
      href: 'https://crudhunt.com/docs',
      external: true,
    },
  ],
};
