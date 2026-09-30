import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { UserRole } from '../models/User';
import { Parser } from 'json2csv';

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    // Only allow COMPANY_ADMIN or SITE_MANAGER or SUPER_ADMIN
    if (![UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.SITE_MANAGER].includes(user.role)) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const { action, resource, startDate, endDate, page = 1, limit = 50, actorId } = req.query;
    
    const filter: any = {};
    if (user.role !== UserRole.SUPER_ADMIN) {
      filter.companyId = user.companyId;
    }

    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (actorId) filter.userId = actorId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .populate('userId', 'firstName lastName email employeeId role')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
    ]);

    // Redact sensitive details just in case
    const sanitizedLogs = logs.map(log => {
      const obj = log.toObject();
      if (obj.details?.passwordHash) delete obj.details.passwordHash;
      if (obj.details?.token) delete obj.details.token;
      return obj;
    });

    res.json({
      data: sanitizedLogs,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

export const exportAuditLogsCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    if (![UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN].includes(user.role)) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const filter: any = {};
    if (user.role !== UserRole.SUPER_ADMIN) {
      filter.companyId = user.companyId;
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(5000); // Prevent massive memory dumps

    const escapeCsv = (str: any) => {
      if (!str) return '';
      let s = String(str);
      // Protect against formula injection
      if (s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')) {
        s = "'" + s;
      }
      return s;
    };

    const csvData = logs.map((log: any) => ({
      'Date': new Date(log.createdAt).toISOString(),
      'Actor': log.userId ? `${log.userId.firstName} ${log.userId.lastName} (${log.userId.email})` : 'System',
      'Role': log.userId?.role || 'System',
      'Action': escapeCsv(log.action),
      'Resource': escapeCsv(log.resource),
      'IP Address': escapeCsv(log.ipAddress || 'Unknown'),
      'Details': escapeCsv(JSON.stringify(log.details || {}))
    }));

    if (csvData.length === 0) {
      res.status(404).json({ error: { message: 'No audit logs found for export' } });
      return;
    }

    const fields = ['Date', 'Actor', 'Role', 'Action', 'Resource', 'IP Address', 'Details'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(csvData);

    // Audit the export action
    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'EXPORT_AUDIT_LOGS',
      resource: 'AuditLog',
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`audit_logs_${new Date().toISOString()}.csv`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};
