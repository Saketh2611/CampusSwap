import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models';

export const campusesData = [
  {
    id: 'stanford',
    name: 'Stanford University',
    shortName: 'Stanford',
    location: 'Stanford, CA',
    verifiedStudents: 14200,
    activeListings: 420,
    safePickupZones: [
      { name: 'Green Library Rotunda', landmark: 'Central Campus', safeZoneHours: '24/7 Security Desk' },
      { name: 'Tressider Memorial Union Plaza', landmark: 'Campus Center', safeZoneHours: '8:00 AM - 10:00 PM' },
      { name: 'Wilbur / Stern Dining Hall Quad', landmark: 'East Campus Residences', safeZoneHours: '7:00 AM - 11:00 PM' },
      { name: 'Huang Engineering Center Lobby', landmark: 'Science & Engineering Quad', safeZoneHours: '8:00 AM - 9:00 PM' },
    ],
  },
  {
    id: 'berkeley',
    name: 'UC Berkeley',
    shortName: 'Cal Berkeley',
    location: 'Berkeley, CA',
    verifiedStudents: 31000,
    activeListings: 890,
    safePickupZones: [
      { name: 'Martin Luther King Jr. Student Union', landmark: 'Sproul Plaza', safeZoneHours: '7:00 AM - 11:00 PM' },
      { name: 'Moffitt Library 3rd Floor Entrance', landmark: 'Memorial Glade', safeZoneHours: '24 Hours' },
      { name: 'Unit 1 / Unit 2 Courtyards', landmark: 'South Campus Dorms', safeZoneHours: '8:00 AM - 10:00 PM' },
      { name: 'RSF (Recreational Sports Facility) Lobby', landmark: 'Bancroft Way', safeZoneHours: '6:00 AM - Midnight' },
    ],
  },
  {
    id: 'nyu',
    name: 'New York University',
    shortName: 'NYU',
    location: 'New York, NY',
    verifiedStudents: 28500,
    activeListings: 710,
    safePickupZones: [
      { name: 'Kimmel Center for University Life', landmark: 'Washington Square South', safeZoneHours: '7:00 AM - 11:00 PM' },
      { name: 'Bobst Library Main Atrium', landmark: 'Washington Square East', safeZoneHours: '24 Hours' },
      { name: 'Paulson Center Lobby', landmark: 'Mercer Street', safeZoneHours: '7:00 AM - 10:00 PM' },
      { name: 'Palladium Residence Hall Desk', landmark: 'Union Square Area', safeZoneHours: '24/7 Monitored' },
    ],
  },
  {
    id: 'utaustin',
    name: 'UT Austin',
    shortName: 'UT Austin',
    location: 'Austin, TX',
    verifiedStudents: 38000,
    activeListings: 950,
    safePickupZones: [
      { name: 'Texas Union South Entrance', landmark: 'Guadalupe St & West Mall', safeZoneHours: '7:00 AM - 10:00 PM' },
      { name: 'PCL (Perry-Castañeda Library) Lobby', landmark: 'Speedway & 21st St', safeZoneHours: '24 Hours' },
      { name: 'Jester Center Concourse', landmark: 'East Mall / Dorm Hub', safeZoneHours: '6:00 AM - Midnight' },
    ],
  },
  {
    id: 'harvard',
    name: 'Harvard University',
    shortName: 'Harvard',
    location: 'Cambridge, MA',
    verifiedStudents: 12800,
    activeListings: 380,
    safePickupZones: [
      { name: 'Smith Campus Center Commons', landmark: 'Harvard Square', safeZoneHours: '7:00 AM - 10:00 PM' },
      { name: 'Widener Library Front Steps', landmark: 'Harvard Yard', safeZoneHours: 'Daylight Hours' },
      { name: 'Cabot Science Library Lobby', landmark: 'Science Center', safeZoneHours: '24 Hours' },
    ],
  },
  {
    id: 'mit',
    name: 'MIT',
    shortName: 'MIT',
    location: 'Cambridge, MA',
    verifiedStudents: 11500,
    activeListings: 340,
    safePickupZones: [
      { name: 'Stratton Student Center (Building W20)', landmark: '84 Massachusetts Ave', safeZoneHours: '24 Hours' },
      { name: 'Stata Center Main Lobby (Building 32)', landmark: 'Vassar Street', safeZoneHours: '8:00 AM - 9:00 PM' },
      { name: 'Hayden Memorial Library', landmark: 'Memorial Drive', safeZoneHours: '8:00 AM - Midnight' },
    ],
  },
];

export class CampusController {
  static getCampuses(req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      data: campusesData,
    });
  }

  static getCampusById(req: Request, res: Response): void {
    const { id } = req.params;
    const campus = campusesData.find((c) => c.id.toLowerCase() === id.toLowerCase() || c.shortName.toLowerCase() === id.toLowerCase());
    if (!campus) {
      res.status(404).json({ success: false, message: 'Campus not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: campus,
    });
  }
}

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const notifications = await Notification.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 30,
      });
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markAllRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      await Notification.update({ read: true }, { where: { userId: req.user.id, read: false } });
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
