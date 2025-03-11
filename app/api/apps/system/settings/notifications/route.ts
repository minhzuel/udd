import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/api';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { NotificationSettingsSchema } from '@/app/apps/system/settings/forms/notification-settings-schema';

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const currentUser = await getDemoUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized action.' },
        { status: 401 }, // Access denied
      );
    }

    const clientIp = getClientIP(request);
    const settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      return NextResponse.json(
        { message: 'Settings not found.' },
        { status: 404 },
      );
    }

    // Parse the request body
    const body = await request.json();
    const parsedData = NotificationSettingsSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 }, // Bad Request
      );
    }

    // Update the settings in the database
    const updatedSettings = await prisma.systemSetting.update({
      where: { id: settings.id }, // Adjust based on your logic to fetch the correct setting
      data: parsedData.data,
    });

    // Log the event
    await systemLog({
      event: 'update',
      userId: currentUser.id,
      entityId: currentUser.id,
      entityType: 'system.settings',
      description: 'System notifications updated.',
      ipAddress: clientIp,
    });

    // Return success response
    return NextResponse.json(
      {
        message: 'Notification settings updated successfully',
        data: updatedSettings,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message: 'An error occurred while updating the notification settings.',
      },
      { status: 500 },
    );
  }
}
