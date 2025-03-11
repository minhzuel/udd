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
  name: 'ReUI',
  url: 'https://reui.io',
  ogImage: 'https://reui.io/og.jpg',
  description:
    'An open-source collection of copy-and-paste UI components and fully functional apps build with React, Next.js and Tailwind CSS',
  links: {
    privacy: '/privacy-policy',
    twitter: 'https://x.com/reui_io',
    github: 'https://github.com/keenthemes/reui',
    suggestions:
      'https://github.com/keenthemes/reui/discussions/categories/suggestions',
  },
  nav: [
    {
      title: 'Apps',
      children: [
        {
          title: 'User',
          children: [
            {
              title: 'Users',
              href: '/apps/user/users',
            },
            {
              title: 'Roles',
              href: '/apps/user/roles',
            },
            {
              title: 'Permissions',
              href: '/apps/user/permissions',
            },
            {
              title: 'Account',
              href: '/apps/user/account',
            },
          ],
        },
        {
          title: 'System',
          children: [
            {
              title: 'Settings',
              href: '/apps/system/settings',
            },
            {
              title: 'Logs',
              href: '/apps/system/logs',
            },
          ],
        },
        {
          title: 'eCommerce',
          children: [
            {
              title: 'Categories',
              href: '/apps/ecommerce/categories',
            },
            {
              title: 'Products',
              href: '/apps/ecommerce/products',
            },
          ],
        },
      ],
    },
    {
      title: 'Components',
      href: 'https://reui.io/components',
      external: true,
    },
    {
      title: 'Products',
      href: 'https://keenthemes.com/',
      external: true,
    },
    {
      title: 'Docs',
      href: 'https://reui.io/docs',
      external: true,
    },
  ],
};
