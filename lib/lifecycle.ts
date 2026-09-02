import { ViewingStatus, Role } from '@prisma/client';

export const ALLOWED_TRANSITIONS: Record<ViewingStatus, ViewingStatus[]> = {
  [ViewingStatus.requested]: [ViewingStatus.accepted, ViewingStatus.declined],
  [ViewingStatus.accepted]: [ViewingStatus.en_route, ViewingStatus.cancelled],
  [ViewingStatus.en_route]: [ViewingStatus.arrived, ViewingStatus.cancelled],
  [ViewingStatus.arrived]: [ViewingStatus.completed],
  [ViewingStatus.declined]: [],
  [ViewingStatus.completed]: [],
  [ViewingStatus.cancelled]: [],
};

export function isValidTransition(currentStatus: ViewingStatus, targetStatus: ViewingStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

export function isUserAuthorizedForTransition(
  userRole: Role,
  isBuyer: boolean,
  isAgent: boolean,
  currentStatus: ViewingStatus,
  targetStatus: ViewingStatus
): boolean {
  if (userRole === Role.admin) {
    return true; // Admin has agency-wide authority
  }

  // Buyer permissions:
  // - accepted -> en_route
  // - accepted -> cancelled
  // - en_route -> arrived
  // - en_route -> cancelled
  if (isBuyer) {
    if (currentStatus === ViewingStatus.accepted && (targetStatus === ViewingStatus.en_route || targetStatus === ViewingStatus.cancelled)) {
      return true;
    }
    if (currentStatus === ViewingStatus.en_route && (targetStatus === ViewingStatus.arrived || targetStatus === ViewingStatus.cancelled)) {
      return true;
    }
    return false;
  }

  // Agent permissions:
  // - requested -> accepted
  // - requested -> declined
  // - en_route -> arrived (fallback)
  // - arrived -> completed
  if (isAgent) {
    if (currentStatus === ViewingStatus.requested && (targetStatus === ViewingStatus.accepted || targetStatus === ViewingStatus.declined)) {
      return true;
    }
    if (currentStatus === ViewingStatus.en_route && targetStatus === ViewingStatus.arrived) {
      return true;
    }
    if (currentStatus === ViewingStatus.arrived && targetStatus === ViewingStatus.completed) {
      return true;
    }
    return false;
  }

  return false;
}
