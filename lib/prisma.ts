import type { PrismaClient } from '@prisma/client';
import { mockStore } from './mock-store';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Safe dynamic loader for @prisma/client that will never crash if .prisma is missing in Electron asar
let PrismaClientConstructor: any = null;
try {
  // Use require dynamically so bundlers/runtimes don't throw top-level module not found
  const prismaPackage = require('@prisma/client');
  PrismaClientConstructor = prismaPackage.PrismaClient;
} catch (err: any) {
  console.warn('Prisma client package could not be loaded, using seed data store:', err?.message);
}

function createPrismaProxy() {
  let realPrisma: any = null;
  if (PrismaClientConstructor) {
    try {
      realPrisma = new PrismaClientConstructor({
        datasourceUrl:
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5432/viewing_coordinator?schema=public',
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    } catch (e: any) {
      console.warn('Failed to construct PrismaClient:', e?.message);
    }
  }

  // Check if error is database missing / connection error
  const isDbUnavailable = (err: any) => {
    if (!err) return false;
    const msg = String(err.message || err);
    return (
      msg.includes("Can't reach database server") ||
      msg.includes('connection refused') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('P1001') ||
      msg.includes('P1002') ||
      msg.includes('P1003') ||
      msg.includes('Environment variable not found') ||
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes('localhost')
    );
  };

  const modelMap: Record<string, any> = {
    user: {
      findUnique: (where: any) => mockStore.findUserUnique(where),
      findMany: (args: any) => mockStore.findUsers(args),
      create: (args: any) => mockStore.createUser(args?.data || args),
      update: (args: any) => mockStore.updateUser(args.where, args.data),
    },
    listing: {
      findMany: (args: any) => mockStore.findListings(args),
      findUnique: (where: any) => mockStore.findListingUnique(where),
      count: (args: any) => mockStore.countListings(args),
      create: (args: any) => mockStore.createListing(args?.data || args),
      update: (args: any) => mockStore.updateListing(args.where, args.data),
      delete: (args: any) => mockStore.deleteListing(args.where),
    },
    viewing: {
      findMany: (args: any) => mockStore.findViewings(args),
      findUnique: (where: any) => mockStore.findViewingUnique(where),
      count: (args: any) => mockStore.countViewings(args),
      create: (args: any) => mockStore.createViewing(args?.data || args),
      update: (args: any) => mockStore.updateViewing(args.where, args.data),
    },
    favorite: {
      findMany: (args: any) => mockStore.findFavorites(args?.where || {}),
      create: (args: any) => mockStore.createFavorite(args?.data || args),
      delete: (args: any) => mockStore.deleteFavorite(args.where),
      deleteMany: (args: any) => mockStore.deleteFavorite(args.where),
    },
    locationPing: {
      create: (args: any) => mockStore.createLocationPing(args?.data || args),
      findFirst: (args: any) => mockStore.findFirstLocationPing(args?.where || {}),
    },
  };

  return new Proxy(realPrisma || {}, {
    get(target, prop: string) {
      if (modelMap[prop]) {
        const targetModel = (target as any)[prop];
        return new Proxy(targetModel || {}, {
          get(modelTarget, method: string) {
            return async (...args: any[]) => {
              // If real Prisma is not available, go straight to mockStore
              if (!realPrisma || typeof modelTarget[method] !== 'function') {
                if (modelMap[prop][method]) {
                  const arg0 = args[0];
                  const whereOrArg = arg0?.where !== undefined ? arg0.where : arg0;
                  return modelMap[prop][method](
                    method === 'findMany' || method === 'count' ? arg0 : whereOrArg,
                    arg0?.data
                  );
                }
                return null;
              }

              // If on Vercel without a real remote DB, use mockStore directly
              const isVercelLocalhost =
                process.env.VERCEL &&
                (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost'));

              if (isVercelLocalhost && modelMap[prop][method]) {
                const arg0 = args[0];
                const whereOrArg = arg0?.where !== undefined ? arg0.where : arg0;
                return modelMap[prop][method](
                  method === 'findMany' || method === 'count' ? arg0 : whereOrArg,
                  arg0?.data
                );
              }

              try {
                return await modelTarget[method](...args);
              } catch (err: any) {
                if (isDbUnavailable(err) && modelMap[prop][method]) {
                  const arg0 = args[0];
                  const whereOrArg = arg0?.where !== undefined ? arg0.where : arg0;
                  return modelMap[prop][method](
                    method === 'findMany' || method === 'count' ? arg0 : whereOrArg,
                    arg0?.data
                  );
                }
                throw err;
              }
            };
          },
        });
      }

      return (target as any)[prop];
    },
  });
}

export const prisma: PrismaClient = (globalForPrisma.prisma ??
  createPrismaProxy()) as unknown as PrismaClient;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
