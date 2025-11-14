import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '../../db/schema/index';
import { DRIZZLE_ORM } from '../../constants';
import { eq, inArray } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  async create(userIdFromParam: string, createOrderDto: CreateOrderDto) {
    console.log('Creating order for user:', userIdFromParam, 'restaurant:', createOrderDto.restaurantId);
    const { restaurantId, deliveryAddress, notes } = createOrderDto;

    return this.db.transaction(async (tx) => {
      // 1. Get user's cart items
      const allCartItems = await tx.query.cartItems.findMany({
        where: eq(schema.cartItems.userId, userIdFromParam),
        with: {
          menuItem: {
            with: {
              restaurant: true,
            },
          },
        },
      }) as any[];

      console.log('Found cart items:', allCartItems.length);

      // Filter cart items for the specific restaurant
      const userCartItems = allCartItems.filter(
        (item) => item.menuItem?.restaurant?.id === restaurantId
      );

      console.log('Cart items for restaurant:', userCartItems.length);

      if (userCartItems.length === 0) {
        throw new NotFoundException('Your cart is empty for this restaurant.');
      }

      // 2. Calculate total price from current menu prices
      const totalPrice = userCartItems.reduce((total, item) => {
        return total + item.menuItem.price * item.quantity;
      }, 0);

      // 3. Create the order
      const [newOrder] = await tx
        .insert(schema.orders)
        .values({
          userId: userIdFromParam,
          restaurantId,
          deliveryAddress,
          notes,
          totalPrice,
        })
        .returning();

      // 4. Create order items
      const orderItemsToInsert = userCartItems.map((cartItem) => ({
        orderId: newOrder.id,
        menuItemId: cartItem.menuItemId,
        quantity: cartItem.quantity,
        priceAtOrder: cartItem.menuItem.price,
      }));

      await tx.insert(schema.orderItems).values(orderItemsToInsert);

      // 5. Clear the user's cart
      const cartItemIds = userCartItems.map((item) => item.id);
      await tx.delete(schema.cartItems).where(inArray(schema.cartItems.id, cartItemIds));

      // 6. Create a notification for the user
      await this.notificationsService.create(userIdFromParam, {
        message: `Your order #${newOrder.id} has been placed successfully!`,
      });

      return newOrder;
    });
  }

  async createMultiRestaurantOrders(userIdFromParam: string, deliveryAddress: string, notes?: string) {
    console.log('Creating multi-restaurant orders for user:', userIdFromParam);

    return this.db.transaction(async (tx) => {
      // 1. Get all user's cart items
      const allCartItems = await tx.query.cartItems.findMany({
        where: eq(schema.cartItems.userId, userIdFromParam),
        with: {
          menuItem: {
            with: {
              restaurant: true,
            },
          },
        },
      }) as any[];

      console.log('Found cart items:', allCartItems.length);

      if (allCartItems.length === 0) {
        throw new NotFoundException('Your cart is empty.');
      }

      // 2. Group cart items by restaurant
      const itemsByRestaurant = allCartItems.reduce((acc, item) => {
        const restaurantId = item.menuItem?.restaurant?.id;
        if (!restaurantId) return acc;
        
        if (!acc[restaurantId]) {
          acc[restaurantId] = [];
        }
        acc[restaurantId].push(item);
        return acc;
      }, {} as Record<number, any[]>);

      const restaurantIds = Object.keys(itemsByRestaurant).map(Number);
      console.log('Creating orders for restaurants:', restaurantIds);

      // 3. Create one order per restaurant
      const createdOrders: any[] = [];
      
      for (const restaurantId of restaurantIds) {
        const restaurantItems = itemsByRestaurant[restaurantId];
        
        // Calculate total price for this restaurant
        const totalPrice = restaurantItems.reduce((total, item) => {
          return total + item.menuItem.price * item.quantity;
        }, 0);

        // Create the order
        const [newOrder] = await tx
          .insert(schema.orders)
          .values({
            userId: userIdFromParam,
            restaurantId,
            deliveryAddress,
            notes,
            totalPrice,
          })
          .returning();

        // Create order items
        const orderItemsToInsert = restaurantItems.map((cartItem) => ({
          orderId: newOrder.id,
          menuItemId: cartItem.menuItemId,
          quantity: cartItem.quantity,
          priceAtOrder: cartItem.menuItem.price,
        }));

        await tx.insert(schema.orderItems).values(orderItemsToInsert);

        createdOrders.push(newOrder);
      }

      // 4. Clear the entire cart
      const allCartItemIds = allCartItems.map((item) => item.id);
      await tx.delete(schema.cartItems).where(inArray(schema.cartItems.id, allCartItemIds));

      // 5. Create a notification for the user
      const orderCount = createdOrders.length;
      const orderIds = createdOrders.map(o => `#${o.id}`).join(', ');
      await this.notificationsService.create(userIdFromParam, {
        message: orderCount === 1 
          ? `Your order ${orderIds} has been placed successfully!`
          : `Your ${orderCount} orders (${orderIds}) have been placed successfully!`,
      });

      return createdOrders;
    });
  }

  findAllForUser(userId: string) {
    return this.db.query.orders.findMany({
      where: eq(schema.orders.userId, userId),
      with: { orderItems: true, restaurant: true },
    });
  }

  findAllForRestaurant(restaurantId: number) {
    return this.db.query.orders.findMany({
      where: eq(schema.orders.restaurantId, restaurantId),
      with: { orderItems: true, user: true },
    });
  }

  findOne(id: number) {
    return this.db.query.orders.findFirst({
      where: eq(schema.orders.id, id),
      with: { orderItems: { with: { menuItem: true } }, user: true, restaurant: true },
    });
  }

  findAllForDeliveryPerson(deliveryPersonId: string) {
    return this.db.query.orders.findMany({
      where: eq(schema.orders.deliveryPersonId, deliveryPersonId),
      with: { orderItems: true, user: true, restaurant: true },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    // Get the order before updating to check status change
    const existingOrder = await this.db.query.orders.findFirst({
      where: eq(schema.orders.id, id),
    });

    const updatedOrders = await this.db
      .update(schema.orders)
      .set(updateOrderDto)
      .where(eq(schema.orders.id, id))
      .returning();

    // If status changed to 'delivered', send push notification
    if (
      existingOrder &&
      updateOrderDto.status === 'delivered' &&
      existingOrder.status !== 'delivered'
    ) {
      try {
        console.log('Sending push notification for order:', id, 'to user:', existingOrder.userId);
        
        await this.pushNotificationsService.sendPushNotification(
          existingOrder.userId,
          'Order Delivered! 🎉',
          `Your order #${id} has been delivered successfully. Enjoy your meal!`,
          { orderId: id, type: 'order_delivered' }
        );

        // Also create an in-app notification
        await this.notificationsService.create(existingOrder.userId, {
          message: `Your order #${id} has been delivered!`,
        });
        
        console.log('Push notification sent successfully for order:', id);
      } catch (error) {
        console.error('Failed to send push notification for order:', id, error);
        // Don't throw error - we still want to return the updated order
      }
    }

    return updatedOrders;
  }

  remove(id: number) {
    return this.db.delete(schema.orders).where(eq(schema.orders.id, id)).returning();
  }
}
