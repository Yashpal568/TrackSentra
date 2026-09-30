import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { globalLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import siteRoutes from './routes/site.routes';
import guardRoutes from './routes/guard.routes';
import shiftRoutes from './routes/shift.routes';
import checkpointRoutes from './routes/checkpoint.routes';
import patrolRoutes from './routes/patrol.routes';
import reportRoutes from './routes/report.routes';
import incidentRoutes from './routes/incident.routes';
import auditRoutes from './routes/audit.routes';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/guards', guardRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/patrols', patrolRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

export default app;
