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
    const commentNotifications = await this.prisma.commentNotification.findMany(
      {
        where: { userId, readStatus: false },
        include: {
          Comment: {
            include: {
              Post: {
                select: {
                  BookDiscussion: true,
                  ProConDiscussion: true,
                },
              },
            },
          },
        },
      },
    );

    return commentNotifications.map((notification) => {
      const type = (() => {
        if (notification.Comment.Post.BookDiscussion !== null) {
          return 'book';
        }

        if (notification.Comment.Post.ProConDiscussion !== null) {
          return 'proCon';
        }

        return null;
      })();

      return {
        id: notification.id,
        type,
        postId: notification.Comment.postId,
        commentId: notification.commentId,
        content: notification.Comment.content,
        readStatus: notification.readStatus,
        createdAt: notification.Comment.createdAt,
        updatedAt: notification.Comment.updatedAt,
      };
    });
  }

  async markAsRead(notificationId: number) {
    const notification = await this.prisma.commentNotification.update({
      where: { id: notificationId },
      data: { readStatus: true },
      include: {
        Comment: {
          include: {
            Post: {
              select: {
                BookDiscussion: true,
                ProConDiscussion: true,
              },
            },
          },
        },
      },
    });

    const type = (() => {
      if (notification.Comment.Post.BookDiscussion !== null) {
        return 'book';
      }

      if (notification.Comment.Post.ProConDiscussion !== null) {
        return 'proCon';
      }

      return null;
    })();

    return {
      id: notification.id,
      type,
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
