import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDatabase } from './db';
import apiRoutes from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import User from './models/User';
import Lead from './models/Lead';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file uploads statically
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api', apiRoutes);

// Root route for sanity check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AuraCRM API Engine.' });
});

// Central Error Handler
app.use(errorHandler);

// Database Bootstrap & Seed
const bootstrap = async () => {
  try {
    // Connect to MongoDB (live or in-memory fallback)
    await connectDatabase({
      mongoUri: process.env.MONGODB_URI,
    });

    // Seed mock data if database is empty to provide a beautiful initial presentation!
    await seedDatabase();

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`✨ [CRM Backend Engine]: Server listening on port ${PORT}`);
      console.log(`✨ [API Base]: http://localhost:${PORT}/api`);
    });

  } catch (error) {
    console.error('❌ [Critical Server Boot Error]:', error);
    process.exit(1);
  }
};

// Seeding standard accounts, leads, and entries for review evaluation
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ [Database Seeder]: Database already contains data. Skipping seeder.');
      return;
    }

    console.log('🌱 [Database Seeder]: Database is empty. Seeding initial CRM dataset...');

    // 1. Create default Sales Representative and Admin
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    const demoRep = new User({
      name: 'Sarah Connor',
      email: 'sarah.connor@auracrm.com',
      passwordHash: defaultPasswordHash,
      role: 'Sales Representative',
    });

    const demoAdmin = new User({
      name: 'Bruce Wayne',
      email: 'bruce.wayne@auracrm.com',
      passwordHash: defaultPasswordHash,
      role: 'Sales Manager',
    });

    await demoRep.save();
    await demoAdmin.save();

    console.log(`🌱 [Database Seeder]: Created users:
      - Sales Rep: ${demoRep.email} (pwd: password123)
      - Manager: ${demoAdmin.email} (pwd: password123)`);

    // 2. Create sample leads
    const sampleLeads = [
      {
        name: 'Tony Stark',
        company: 'Stark Industries',
        email: 'tony@starkindustries.com',
        phone: '+1 (555) 019-2834',
        industry: 'Technology',
        country: 'United States',
        source: 'Website Lead',
        status: 'Proposal',
        expectedRevenue: 120000,
        owner: demoRep._id,
      },
      {
        name: 'Pepper Potts',
        company: 'Stark Enterprises',
        email: 'pepper@stark.com',
        phone: '+1 (555) 019-8877',
        industry: 'Aerospace',
        country: 'United States',
        source: 'Referral',
        status: 'Won',
        expectedRevenue: 250000,
        owner: demoRep._id,
      },
      {
        name: 'Peter Parker',
        company: 'Daily Bugle Tech',
        email: 'peter.parker@dailybugle.com',
        phone: '+1 (555) 123-4567',
        industry: 'Media & Entertainment',
        country: 'Canada',
        source: 'Cold Outreach',
        status: 'Contacted',
        expectedRevenue: 15000,
        owner: demoRep._id,
      },
      {
        name: 'Clark Kent',
        company: 'Daily Planet Corp',
        email: 'clark.kent@dailyplanet.com',
        phone: '+1 (555) 987-6543',
        industry: 'Publishing',
        country: 'United Kingdom',
        source: 'Inbound Inquiry',
        status: 'Qualified',
        expectedRevenue: 45000,
        owner: demoAdmin._id,
      },
      {
        name: 'Arthur Dent',
        company: 'Megadodo Publications',
        email: 'arthur.dent@hitchhiker.org',
        phone: '+44 20 7946 0958',
        industry: 'Publishing',
        country: 'United Kingdom',
        source: 'Partner Lead',
        status: 'New',
        expectedRevenue: 8500,
        owner: demoRep._id,
      },
      {
        name: 'Diana Prince',
        company: 'Themyscira Antiques',
        email: 'diana@themyscira.org',
        phone: '+30 21 0345 6789',
        industry: 'Retail & Luxury',
        country: 'Greece',
        source: 'Event Attendee',
        status: 'Won',
        expectedRevenue: 300000,
        owner: demoAdmin._id,
      },
      {
        name: 'Wade Wilson',
        company: 'Mercenary Solutions',
        email: 'wade@mercsol.com',
        phone: '+1 (555) 666-4321',
        industry: 'Healthcare',
        country: 'Canada',
        source: 'Cold Outreach',
        status: 'Lost',
        expectedRevenue: 50000,
        owner: demoRep._id,
      }
    ];

    await Lead.insertMany(sampleLeads);
    console.log('🌱 [Database Seeder]: Seeded 7 sample leads across multiple industries.');

  } catch (error) {
    console.error('❌ [Database Seeder Error]: Seeding failed:', error);
  }
};

// Fire up the backend engine!
bootstrap();

