import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from './auth';
import { prisma } from './prisma';
import { ViewingStatus, Role } from '@prisma/client';
import cookie from 'cookie';

declare global {
  var io: SocketIOServer | undefined;
}

export function getIO(): SocketIOServer | null {
  return globalThis.io || null;
}

export function initSocketServer(io: SocketIOServer) {
  globalThis.io = io;

  // Socket.io middleware for JWT authentication
  io.use(async (socket: Socket, next) => {
    try {
      let token: string | undefined;

      // 1. Try handshake auth token
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      // 2. Try cookie header
      if (!token && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.auth_token;
      }

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, role: true, is_active: true },
      });

      if (!user || !user.is_active) {
        return next(new Error('Authentication error: User inactive or not found'));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Server error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // Auto-join personal user room
    if (user.role === Role.agent) {
      socket.join(`agent:${user.id}`);
    } else if (user.role === Role.buyer) {
      socket.join(`buyer:${user.id}`);
    } else if (user.role === Role.admin) {
      socket.join('admin');
    }

    // Join viewing room for live tracking (Stream B)
    socket.on('join_viewing_room', async ({ viewingId }: { viewingId: string }) => {
      try {
        if (!viewingId) return;

        const viewing = await prisma.viewing.findUnique({
          where: { id: viewingId },
          include: { listing: true },
        });

        if (!viewing) {
          socket.emit('error', { message: 'Viewing not found' });
          return;
        }

        // Must be en_route for live location tracking room
        if (viewing.status !== ViewingStatus.en_route) {
          socket.emit('error', { message: 'Location room is only available while en_route' });
          return;
        }

        // Verify authorization: must be the buyer, assigned agent, or admin
        const isBuyer = user.role === Role.buyer && viewing.buyer_id === user.id;
        const isAgent = user.role === Role.agent && viewing.agent_id === user.id;
        const isAdmin = user.role === Role.admin;

        if (!isBuyer && !isAgent && !isAdmin) {
          socket.emit('error', { message: 'Forbidden: Unauthorized for this viewing' });
          return;
        }

        socket.join(`viewing:${viewingId}`);
        socket.emit('joined_viewing_room', { viewingId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join viewing room' });
      }
    });

    // Handle live location updates from buyer
    socket.on(
      'location:update',
      async ({ viewingId, latitude, longitude }: { viewingId: string; latitude: number; longitude: number }) => {
        try {
          if (!viewingId || typeof latitude !== 'number' || typeof longitude !== 'number') {
            return;
          }

          const viewing = await prisma.viewing.findUnique({
            where: { id: viewingId },
          });

          if (!viewing) return;

          // Strictly allowed only while en_route
          if (viewing.status !== ViewingStatus.en_route) {
            return;
          }

          // Must be the buyer who owns the viewing
          if (viewing.buyer_id !== user.id && user.role !== Role.admin) {
            return;
          }

          const ping = {
            latitude,
            longitude,
            recorded_at: new Date().toISOString(),
          };

          // Broadcast to viewing room (only assigned agent & admin)
          io.to(`viewing:${viewingId}`).emit('location:ping', {
            viewingId,
            ...ping,
          });

          // Optionally record ping to database asynchronously
          await prisma.locationPing.create({
            data: {
              viewing_id: viewingId,
              latitude,
              longitude,
            },
          }).catch(() => {});
        } catch (err) {
          console.error('Error handling location update:', err);
        }
      }
    );

    socket.on('disconnect', () => {
      // Clean up socket connections
    });
  });
}

/**
 * Broadcast viewing updates to relevant agent and buyer
 */
export function broadcastViewingUpdate(viewing: any) {
  const io = getIO();
  if (!io) return;

  // Emit to agent room
  if (viewing.agent_id) {
    io.to(`agent:${viewing.agent_id}`).emit('viewing:updated', viewing);
  }

  // Emit to buyer room
  if (viewing.buyer_id) {
    io.to(`buyer:${viewing.buyer_id}`).emit('viewing:updated', viewing);
  }

  // Emit to admin room
  io.to('admin').emit('viewing:updated', viewing);

  // If status is no longer en_route, tear down viewing room
  if (viewing.status !== ViewingStatus.en_route) {
    io.to(`viewing:${viewing.id}`).emit('viewing:stream_ended', { viewingId: viewing.id, status: viewing.status });
    // In Socket.io, sockets will also leave the room or ignore further pings
  }
}
