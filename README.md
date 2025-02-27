Supercharge your app development with CrudHunt's free, full-cycle CRUD examples and 50+ UI components, powered by React, Next.js and styled with Tailwind.

**Live Demo** → [https://CrudHunt.com](https://CrudHunt.com)

## Overview

CrudHunt leverages Next.js to power both the frontend and backend, efficiently delivering robust CRUD prototypes with seamless portability to other tech stacks. The backend is built using Next.js API routes, Prisma, and PostgreSQL, featuring a modular architecture that allows end users to easily adapt it to their own backend environments.

## Install Components

### Prerequisites

Before you can install and use CrudHunt, make sure your project meets the following requirements:

- **React**: Version 19 or higher.
- **TypeScript**: Version 5.7 or higher.
- **Tailwind CSS**: Version 4 or higher.

### Get CrudHunt Source Code

Download [CrudHunt](http://github.com/keenthemes/CrudHunt) source code or clone it via Git into your machine:

```bash
git clone https://github.com/keenthemes/CrudHunt.git
```

### Initialize a React Project

CrudHunt is compatible with various React frameworks. Choose the one that best fits your needs:

- [Next.js](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
- [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project)
- [Remix](https://remix.run/docs/en/main/start/quickstart)
- [Astro](https://docs.astro.build/en/install-and-setup/)
- [Laravel Inertia](https://inertiajs.com/client-side-setup)
- [Gatsby](https://www.gatsbyjs.com/docs/tutorial/getting-started/part-0/)

> [!WARNING]
> If you already have a React project with TypeScript and Tailwind CSS, you
> can skip this step.

### Install Tailwind

Follow [Instalation Guide](https://tailwindcss.com/docs/installation/framework-guides) to setup Tailwind for your React project.

### Add Tailwind CSS Animate

```bash
npm i tailwindcss-animate
```

This plugin is required for smooth animation effects used by Accordion, Dialog, Popover and other elements.

### Integrate CrudHunt Styles

Add below code into your Tailwind entry style file `styles/globals.css`:

```css showLineNumbers
@import 'tailwindcss';

@plugin 'tailwindcss-animate';

/** Dark Mode Variant **/
@custom-variant dark (&:is(.dark *));

/** Theme Colors **/
:root {
  /** Base Colors **/
  --background: 0 0% 100%;
  --foreground: 240 10% 3%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3%;

  /** Contextual Colors **/
  --muted: 0 0% 97%;
  --muted-darker: 0 0% 94%;
  --muted-foreground: 240 3% 40%;
  --accent: 0 0% 96%;
  --accent-darker: 0 0% 93%;
  --accent-foreground: 240 4% 20%;
  --secondary: 0 0% 95%;
  --secondary-darker: 0 0% 92%;
  --secondary-foreground: 240 4% 18%;
  --primary: 212 88% 51%;
  --primary-darker: 212 88% 44%;
  --primary-foreground: 0 0% 100%;
  --mono: 222 15% 13%;
  --mono-darker: 0 0% 0%;
  --mono-foreground: 0 0% 100%;
  --destructive: 349 86% 50%;
  --destructive-darker: 349 86% 44%;
  --destructive-foreground: 0 0% 100%;
  --warning: 47 100% 48%;
  --warning-darker: 47 100% 38%;
  --warning-foreground: 0 0% 100%;
  --success: 137 89% 41%;
  --success-darker: 137 94% 31%;
  --success-foreground: 0 0% 100%;
  --info: 252 83% 52%;
  --info-darker: 252 83% 46%;
  --info-foreground: 0 0% 100%;

  /** Base Styles **/
  --border: 0 0% 94%;
  --input: 0 0% 89%;
  --ring: 0 0% 84%;
  --radius: 0.5rem;
}

.dark {
  /** Base Colors **/
  --background: 240 10% 4%;
  --foreground: 0 0% 90%;
  --card: 240 10% 4%;
  --card-foreground: 0 0% 90%;
  --popover: 240 10% 4%;
  --popover-foreground: 0 0% 90%;

  /** Contextual Colors **/
  --muted: 240 6% 9%;
  --muted-darker: 240 6% 13%;
  --muted-foreground: 240 6% 60%;
  --accent: 240 6% 10%;
  --accent-darker: 240 6% 14%;
  --accent-foreground: 0 0% 98%;
  --secondary: 240 6% 11%;
  --secondary-darker: 240 6% 15%;
  --secondary-foreground: 0 0% 98%;
  --primary: 212 88% 51%;
  --primary-darker: 212 88% 55%;
  --primary-foreground: 0 0% 100%;
  --mono: 0 0% 90%;
  --mono-darker: 0 0% 100%;
  --mono-foreground: 0 0% 0%;
  --destructive: 349 86% 50%;
  --destructive-darker: 349 86% 54%;
  --destructive-foreground: 0 0% 100%;
  --success: 137 89% 40%;
  --success-darker: 137 72% 44%;
  --success-foreground: 0 0% 100%;
  --warning: 47 100% 48%;
  --warning-darker: 47 100% 52%;
  --warning-foreground: 0 0% 100%;
  --info: 256 89% 52%;
  --info-darker: 256 89% 56%;
  --info-foreground: 0 0% 100%;

  /** Base Styles **/
  --border: 230 10% 14%;
  --input: 230 10% 20%;
  --ring: 230 10% 40%;
}

/** Theme Setup **/
@theme inline {
  /** Base Colors **/
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  /** Contextual Colors **/
  --color-muted: hsl(var(--muted));
  --color-muted-darker: hsl(var(--muted-darker));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-darker: hsl(var(--accent-darker));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-darker: hsl(var(--primary-darker));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-darker: hsl(var(--secondary-darker));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-mono: hsl(var(--mono));
  --color-mono-darker: hsl(var(--mono-darker));
  --color-mono-foreground: hsl(var(--mono-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-darker: hsl(var(--destructive-darker));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-success: hsl(var(--success));
  --color-success-darker: hsl(var(--success-darker));
  --color-success-foreground: hsl(var(--success-foreground));

  --color-warning: hsl(var(--warning));
  --color-warning-darker: hsl(var(--warning-darker));
  --color-warning-foreground: hsl(var(--warning-foreground));

  --color-info: hsl(var(--info));
  --color-info-darker: hsl(var(--info-darker));
  --color-info-foreground: hsl(var(--info-foreground));

  /** Base Styles **/
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  --radius-xl: calc(var(--radius) + 4px);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-collapsible-down: collapsible-down 0.2s ease-out;
  --animate-collapsible-up: collapsible-up 0.2s ease-out;
  --animate-caret-blink: caret-blink 1.25s ease-out infinite;

  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }
  @keyframes accordion-up {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
  @keyframes collapsible-down {
    from {
      height: 0;
    }
    to {
      height: var(--radix-collapsible-content-height);
    }
  }
  @keyframes collapsible-up {
    from {
      height: var(--radix-collapsible-content-height);
    }
    to {
      height: 0;
    }
  }
  @keyframes caret-blink {
    0%,
    70%,
    100% {
      opacity: 1;
    }
    20%,
    50% {
      opacity: 0;
    }
  }
}

/** Global Styles **/
@layer base {
  * {
    @apply border-border;
  }

  *:focus-visible {
    @apply outline-ring rounded-xs shadow-none outline-2 outline-offset-3 transition-none!;
  }
}

/** Custom Scrollbar **/
@layer base {
  * {
    @apply border-border;
  }

  *:focus-visible {
    @apply outline-ring rounded-xs shadow-none outline-2 outline-offset-3 transition-none!;
  }

  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 5px;
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
}
```

### Setup Inter Font(Next.js)

Add the following code to your root layout file (`app/layout.tsx` or `src/app/layout.tsx`):

```tsx
import { Inter } from 'next/font/google';
import { cn } from '@/utils/cn';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html className="h-full">
      <body
        className={cn('flex h-full text-base antialiased', inter.className)}
        style={{ overflow: 'visible !important', marginRight: '0 !important' }}
      >
        {children}
      </body>
    </html>
  );
}
```

> [!TIP]
> For a modern and visually appealing design, we recommend using
> [Inter](https://fonts.google.com/specimen/Inter) as the default font in your
> CrudHunt project.

### Add Lucide Icon Library

```bash
npm i lucide
```

### Add Remix Icon Library

```bash
npm i @remixicon/react
```

### Add Tailwind Merge and clsx Library

Tailwind Merge and clsx are used to merge and create class names for the components.

```bash
npm i tailwind-merge
```

```bash
npm i clsx
```

### Add Dependency Files

Copy the `utils.ts` file from `lib` directory in the source code to the `components/ui/` directory in your project.

### Add Components

Explore the [CrudHunt Components](/docs/accordion) and add the ones you need into your project.

---

# CRUDs

This guide will help you get started with CrudHunt's copy-and-paste components and CRUD modules in just a few minutes.

## Prerequisites

Before you can install and use CrudHunt, make sure your project meets the following requirements:

- **Next.js**: Version 15 or higher.
- **React**: Version 19 or higher.
- **TypeScript**: Version 5.7 or higher.
- **Tailwind CSS**: Version 4 or higher.
- **Prisma**: Version 6 or higher.
- **PostgreSQL**: Version 16 or higher.

## Database Setup

Choose one of these options to set up your database:

## 1. Prisma

The Prisma console allows you to manage your Prisma projects and databases through a web interface.
This guide will walk you through the registration process and how to use the console.

### Sign Up for a Prisma Account

- Visit [Prisma](https://www.prisma.io?via=crudhunt).
- Click on the "Get started for free" button.
- You can sign up using your email address or through a third-party service like GitHub or Google.
- Follow the prompts to complete the registration process.

### Create a New Project

- Once logged in, you will be redirected to [Prisma Console](https://console.prisma.io?via=crudhunt).
- Click on "Create New Project."
- Enter a project name.
- Click on "Get Started" button for Prisma Postgres.
- Click "Create project" button.

![Create a New Project](https://crudhunt.com/media/docs/prisma-1.png)

### Obtain Your Connection String

A connection string is a string that your application uses to connect to a database. It contains information such as the database type, host, port, username, password, and database name. In the context of Prisma, the connection string is used to connect your Prisma Client to your database.

- In the left sidebar, click on the "Database" menu.
- Navigate to the "Setup" tab.
- Select the "Existing Project" option.
- Click on the "Generate Database Credentials" button.
- Copy the generated connection string.
- Open your project's `.env` file and add the connection string there.
  ```bash
  DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"
  ```

![Generate Database Credentials](https://crudhunt.com/media/docs/prisma-2.png)

Here's a breakdown of the Prisma connection string:

```bash
DATABASE_URL="prisma+postgres://username:password@host:port/database?api_key=your_api_key"
```

- **prisma+postgres**: Specifies the database type and the protocol Prisma uses to connect.
- **username**: The username for your database.
- **password**: The password for your database.
- **host**: The host address where your database is running.
- **port**: The port number on which your database is listening.
- **database**: The name of your database.
- **api_key**: An optional parameter for additional authentication or configuration.

### Deploy Your Model to the Database

After setting up your Prisma project and obtaining your connection string, the next step is to deploy your Prisma schema to your database. This will create the necessary tables and relationships based on your schema.

- Open your terminal.
- Navigate to your project directory.
- Run the following command to deploy your schema:
  ```bash
  npx prisma db push
  ```
  This command will read your `prisma/schema.prisma` file and apply the changes to your database.

### Generate Prisma Client

Once your schema is deployed, you need to generate the Prisma Client. The Prisma Client is an auto-generated and type-safe query builder that you will use to interact with your database.

- In your terminal, run the following command:
  ```bash
  npx prisma generate
  ```
  This command will generate the Prisma Client based on your schema and save it in the `node_modules/@prisma/client` directory.

## 2. Supabase

To get started with Supabase, follow these steps to register for a free account and obtain your connection string.

### Sign Up

- Visit the [Supabase website](https://supabase.io/).
- Click on the "Start your project" button.
- Sign up using your email address, GitHub, or any other available method.

### Create a New Project

- After signing in, click on the "New Project" button.
- Fill in the required details:
  - **Project Name**: Choose a name for your project.
  - **Organization**: Select or create an organization.
  - **Database Password**: Set a strong password for your database.
- Click on the "Create new project" button.

![Create a New Project](https://crudhunt.com/media/docs/supabase-1.png)

### Configure Database

- Wait for the project to be initialized. This may take a few minutes.
- Once the project is ready, you will be redirected to the project dashboard.

### Get the Connection String

A connection string is a string that your application uses to connect to a database. It contains information such as the database type, host, port, username, password, and database name. In the context of Prisma, the connection string is used to connect your Prisma Client to your database.

- In the project dashboard, click "Connect" button at top.
- Click on "ORMs" tab.
- You will find your database connection string. It will look something like this:
  ```bash
  postgres://username:password@db.supabase.co:5432/dbname
  ```
- Replace `[YOUR-PASSWORD]` placeholder with your Supabase database password.

![Get the Connection String](https://crudhunt.com/media/docs/supabase-2.png)

Here's a breakdown of the Supabase connection string:

- **postgres**: Indicates the database type.
- **username**: Your database username.
- **password**: Your database password.
- **db.supabase.co**: The host address of your Supabase database.
- **5432**: The default port for PostgreSQL databases.
- **dbname**: The name of your database.

### Set Up Environment Variables

- Copy the connection string.
- Open your project's `.env` file.
- Add the following line to set the connection string as an environment variable:
  ```bash
  DATABASE_URL=postgres://username:password@db.supabase.co:5432/dbname
  ```

### Deploy Your Model to the Database

After setting up your Prisma project and obtaining your connection string, the next step is to deploy your Prisma schema to your database. This will create the necessary tables and relationships based on your schema.

- Open your terminal.
- Navigate to your project directory.
- Run the following command to deploy your schema:
  ```bash
  npx prisma db push
  ```
  This command will read your `prisma/schema.prisma` file and apply the changes to your database.

### Generate Prisma Client

Once your schema is deployed, you need to generate the Prisma Client. The Prisma Client is an auto-generated and type-safe query builder that you will use to interact with your database.

- In your terminal, run the following command:
  ```bash
  npx prisma generate
  ```
  This command will generate the Prisma Client based on your schema and save it in the `node_modules/@prisma/client` directory.

## CRUDs Setup

Now let's set up the CRUD modules:

### Get CrudHunt Source Code

CrudHunt's default Next.js app makes launching CRUD operations effortless.
Download the [CrudHunt](http://github.com/keenthemes/CrudHunt) source code or clone it via Git into your machine:

```bash
git clone https://github.com/keenthemes/CrudHunt.git
```

### Copy Dependencies

To setup CRUDs into existing Next.js project copy these files from the source code to your project:

- `lib/db.ts` → `lib/db.ts`
- `lib/prisma.ts` → `lib/prisma.ts`

### Add CRUD Modules

Copy these directories maintaining the same structure:

- `app/` - Contains CRUD route handlers and components.
- `providers/` - Context providers for state management.
- `hooks/` - Custom hooks for data operations.
- `prisma/` - Database schema and migrations.
- `public/` - Static assets.

### Configure Environment

Make sure your `.env` file includes:

```bash
# Database
DATABASE_URL="your_database_connection_string"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### Run Migrations

```bash
npx prisma migrate dev
```

### Generate Types

```bash
npx prisma generate
```

### Start App

```bash
npm run dev
```

> CrudHunt components and CRUD modules can be easily integrated into any React project with minimal modifications.

Happy coding with CrudHunt!
