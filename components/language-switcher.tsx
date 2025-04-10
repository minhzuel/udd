'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  {
    code: 'en',
    name: 'English',
    shortName: 'EN',
    direction: 'ltr',
    flag: '/media/flags/united-states.svg',
  },
  {
    code: 'ar',
    name: 'Arabic',
    shortName: 'AR',
    direction: 'rtl',
    flag: '/media/flags/saudi-arabia.svg',
  },
  {
    code: 'es',
    name: 'Spanish',
    shortName: 'ES',
    direction: 'ltr',
    flag: '/media/flags/spain.svg',
  },
  {
    code: 'de',
    name: 'German',
    shortName: 'DE',
    direction: 'ltr',
    flag: '/media/flags/germany.svg',
  },
  {
    code: 'ch',
    name: 'Chinese',
    shortName: 'CH',
    direction: 'ltr',
    flag: '/media/flags/china.svg',
  },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = React.useState(languages[0]);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setCurrentLang(lang);
    // Here you would typically update the language in your app's state management
    // and possibly make an API call to update the user's preference
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <img
            src={currentLang.flag}
            alt={`${currentLang.name} flag`}
            className="h-4 w-4 rounded-full"
          />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className="flex items-center gap-2"
          >
            <img
              src={lang.flag}
              alt={`${lang.name} flag`}
              className="h-4 w-4 rounded-full"
            />
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 