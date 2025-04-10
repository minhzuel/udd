import { NextResponse } from 'next/server';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if the user is authenticated
    const currentUser = await getDemoUser();
    if (!currentUser || !currentUser.email) {
      return NextResponse.json(
        { message: 'Unauthorized action.' },
        { status: 401 }, // Access denied
      );
    }

    // Fetch the user based on the email in the session
    const user = await prisma.user.findUnique({
      where: { email: currentUser.email },
      include: {
        role: true,
      },
    });

    // Check if record exists
    if (!user) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
