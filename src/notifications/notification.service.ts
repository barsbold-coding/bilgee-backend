import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Notification } from 'src/models/notification.model';
import { User, UserRole, UserStatus } from 'src/models/user.model';
import { paginate } from 'src/utils/pagination';
import {
  CreateNotificationDto,
  NotificationQueryDto,
  UpdateNotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(userId: number, query: NotificationQueryDto) {
    const where: WhereOptions = {
      userId,
    };

    if (query.seen) {
      where.seen = query.seen;
    }

    return this.notificationModel.findAll({
      ...paginate(query),
      where,
    });
  }

  async findAllByUserId(userId: number) {
    return this.notificationModel.findAll({
      where: { userId },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationModel.findByPk(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async create(data: CreateNotificationDto) {
    return this.notificationModel.create({
      ...data,
    });
  }

  async update(id: number, data: UpdateNotificationDto) {
    const notification = await this.findOne(id);

    await notification.update(data);
    return notification;
  }

  async markAsSeen(id: number): Promise<Notification> {
    const notification = await this.findOne(id);

    await notification.update({ seenAt: new Date(), seen: true });
    return notification;
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await notification.destroy();
  }

  async notifyAdmin(organizationId: number, organizationName: string) {
    const adminUsers = await this.userModel.findAll({
      where: { role: UserRole.ADMIN },
    });

    const notificationPromises = adminUsers.map((admin) => {
      return this.create({
        userId: admin.id,
        title: 'New Organization Registration',
        description: `New organization "${organizationName}" has registered and is pending approval.`,
        type: 'ORGANIZATION_REGISTRATION',
        metadata: { organizationId },
      });
    });

    await Promise.all(notificationPromises);
  }

  async notifyOrganizationApproved(organizationId: number) {
    return this.create({
      userId: organizationId,
      title: 'Organization Approved',
      description:
        'Your organization has been approved. You can now access all features.',
      type: 'ORGANIZATION_APPROVED',
      metadata: { status: UserStatus.VERIFIED },
    });
  }

  async notifyOrganizationDeclined(organizationId: number) {
    return this.create({
      userId: organizationId,
      title: 'Organization Registration Declined',
      description:
        'Your organization registration has been declined. Please contact support for more information.',
      type: 'ORGANIZATION_DECLINED',
      metadata: { status: UserStatus.DECLINED },
    });
  }
}
