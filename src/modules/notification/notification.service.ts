import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.commentNotification.create({
      data: createNotificationDto,
    });
  }

  async getNotificationsForUser(userId: number) {
    const commentNotifications = this.prisma.commentNotification.findMany({
      where: { userId, readStatus: false },
      include: {
        Comment: true,
      },
    });

    return (await commentNotifications).map((notification) => ({
      id: notification.id,
      postId: notification.Comment.postId,
      commentId: notification.commentId,
      content: notification.Comment.content,
      createdAt: notification.Comment.createdAt,
      updatedAt: notification.Comment.updatedAt,
      readStatus: notification.readStatus,
    }));
  }

  async markAsRead(notificationId: number) {
    const notification = await this.prisma.commentNotification.update({
      where: { id: notificationId },
      data: { readStatus: true },
      include: { Comment: true },
    });

    return {
      id: notification.id,
      postId: notification.Comment.postId,
      commentId: notification.commentId,
      content: notification.Comment.content,
      createdAt: notification.Comment.createdAt,
      updatedAt: notification.Comment.updatedAt,
      readStatus: notification.readStatus,
    };
  }

  async findOne(notificationId: number) {
    return await this.prisma.commentNotification.findFirst({
      where: { id: notificationId },
    });
  }

  async remove(notificationId: number) {
    const notification = await this.findOne(notificationId);

    if (!notification) {
      throw new NotFoundException(
        `Not found notification: [${notificationId}]`,
      );
    }

    return await this.prisma.commentNotification.delete({
      where: { id: notificationId },
    });
  }
}
