import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification } from 'src/models/notification.model';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
  ) {}

  async findAll() {
    return this.notificationModel.findAll();
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

    await notification.update({ seenAt: new Date() });
    return notification;
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await notification.destroy();
  }
}
