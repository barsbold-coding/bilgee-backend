import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Application, ApplicationStatus } from 'src/models/application.model';
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

    if (query.seen !== undefined) {
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
        title: 'Шинэ байгууллагын бүртгэл',
        description: `"${organizationName}" шинэ байгууллага бүртгүүлсэн бөгөөд зөвшөөрлийг хүлээж байна.`,
        type: 'ORGANIZATION_REGISTRATION',
        metadata: { organizationId },
      });
    });

    await Promise.all(notificationPromises);
  }

  async notifyOrganizationApproved(organizationId: number) {
    return this.create({
      userId: organizationId,
      title: 'Байгууллага батлагдсан',
      description:
        'Танай байгууллагыг зөвшөөрлөө. Та одоо бүх функцэд хандах боломжтой.',
      type: 'ORGANIZATION_APPROVED',
      metadata: { status: UserStatus.VERIFIED },
    });
  }

  async notifyOrganizationDeclined(organizationId: number) {
    return this.create({
      userId: organizationId,
      title: 'Байгууллагыг бүртгэхээс татгалзсан',
      description:
        'Танай байгууллагын бүртгэлээс татгалзсан байна. Дэлгэрэнгүй мэдээллийг холбоо барьж авна уу.',
      type: 'ORGANIZATION_DECLINED',
      metadata: { status: UserStatus.DECLINED },
    });
  }

  // Application-specific notification methods
  async notifyNewApplication(
    employerId: number,
    applicationId: number,
    internshipId: number,
    studentId: number,
    studentName: string,
    internshipTitle: string,
  ) {
    return this.create({
      userId: employerId,
      title: 'Шинэ өргөдөл хүлээн авлаа',
      description: `${studentName} таны дадлага хийх хүсэлт гаргасан: ${internshipTitle}`,
      type: 'NEW_APPLICATION',
      metadata: {
        applicationId,
        internshipId,
        studentId,
      },
    });
  }

  async notifyApplicationStatusChange(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ) {
    return this.create({
      userId: studentId,
      title: 'Өрөгдөлийн статус шинэчлэгдсэн',
      description: `Таны "${internshipTitle}"-д зориулсан өргөдлийг ${oldStatus}-с ${newStatus} болгон шинэчилсэн.`,
      type: 'APPLICATION_STATUS_CHANGED',
      metadata: {
        applicationId,
        internshipId,
        oldStatus,
        newStatus,
      },
    });
  }

  async notifyApplicationAccepted(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    employerName: string,
  ) {
    return this.create({
      userId: studentId,
      title: 'Өргөдлийг хүлээн авлаа!',
      description: `Баяр хүргэе! Таны ${employerName}-д "${internshipTitle}" хамрагдах өргөдлийг хүлээн авлаа.`,
      type: 'APPLICATION_ACCEPTED',
      metadata: {
        applicationId,
        internshipId,
      },
    });
  }

  async notifyApplicationRejected(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    employerName: string,
  ) {
    return this.create({
      userId: studentId,
      title: 'Таны өрөгдөлд татгалзсан хариу өгсөн байна',
      description: `Таны ${employerName}-д "${internshipTitle}"-д хамрагдах өргөдөлд татгалзсан хариу өгсөн байна.`,
      type: 'APPLICATION_REJECTED',
      metadata: {
        applicationId,
        internshipId,
      },
    });
  }

  async notifyApplicationInterview(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    employerName: string,
  ) {
    return this.create({
      userId: studentId,
      title: 'Өргөдлийг хүлээн авлаа',
      description: `Сайн мэдээ! Таны ${employerName}-д "${internshipTitle}"-д хамрагдах өргөдөл зөвшөөрөгдлөө. Цаашдын харилцаа холбоог анхаарч үзээрэй.`,
      type: 'APPLICATION_INTERVIEW',
      metadata: {
        applicationId,
        internshipId,
      },
    });
  }

  async notifyEmployerApplicationUpdate(
    employerId: number,
    applicationId: number,
    internshipId: number,
    studentId: number,
    studentName: string,
    internshipTitle: string,
    status: ApplicationStatus,
  ) {
    let title = 'Өргөдөлийн статус шинэчлэгдсэн';
    let description = `Та ${studentName}-н "${internshipTitle}"-д зориулсан өргөдлийг ${status} болгож шинэчилсэн байна.`;
    let type = 'EMPLOYER_APPLICATION_UPDATE';

    if (status === ApplicationStatus.APPROVED) {
      title = 'Өргөдөлийг баталгаажууллаа';
      description = `Та ${studentName}-н "${internshipTitle}"-н өргөдлийг хүлээн авлаа.`;
      type = 'EMPLOYER_APPLICATION_ACCEPTED';
    } else if (status === ApplicationStatus.REJECTED) {
      title = 'Өргөдөлд татгалзсан';
      description = `Та ${studentName}-н "${internshipTitle}"-д зориулсан өргөдлийг татгалзсан байна.`;
      type = 'EMPLOYER_APPLICATION_REJECTED';
    }

    return this.create({
      userId: employerId,
      title,
      description,
      type,
      metadata: {
        applicationId,
        internshipId,
        studentId,
        status,
      },
    });
  }
}
