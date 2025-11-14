import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '../../db/schema/index';
import { DRIZZLE_ORM } from '../../constants';
import { eq } from 'drizzle-orm';

interface PushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: any;
}

@Injectable()
export class PushNotificationsService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    try {
      console.log('Attempting to send push notification to user:', userId);
      
      // Get user's push token
      const user = await this.db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });

      if (!user) {
        console.log('User not found:', userId);
        return;
      }

      if (!user.pushToken) {
        console.log('No push token found for user:', userId);
        return;
      }

      console.log('Found push token for user:', userId, 'Token:', user.pushToken.substring(0, 20) + '...');

      const message: PushMessage = {
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data,
      };

      console.log('Sending push notification:', { title, body, to: user.pushToken.substring(0, 20) + '...' });

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error('Push notification API returned error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return;
      }

      const result = await response.json();
      console.log('Push notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  async updatePushToken(userId: string, pushToken: string) {
    try {
      await this.db
        .update(schema.users)
        .set({ pushToken })
        .where(eq(schema.users.id, userId));
      
      console.log('Push token updated for user:', userId);
    } catch (error) {
      console.error('Failed to update push token:', error);
      throw error;
    }
  }
}
