import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  buttonText: string;
}

export function RoleCard({ title, description, icon, link, buttonText }: RoleCardProps) {
  return (
    <Card className="hover:shadow-2xl transition-all duration-300 border border-slate-100 bg-slate-50/60 rounded-[2rem] p-4 group flex flex-col justify-between">
      <CardHeader className="text-center pt-6">
        <div className="mx-auto mb-5 p-4 bg-white rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle className="text-2xl font-black font-headline text-slate-900 mb-2">{title}</CardTitle>
        <CardDescription className="px-2 text-slate-600 text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pb-4">
        <Button className="w-full rounded-full h-12 font-bold bg-slate-100 hover:bg-primary hover:text-white text-slate-800 border border-slate-200/60 shadow-sm transition-all" variant="ghost" asChild>
          <Link href={link}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
