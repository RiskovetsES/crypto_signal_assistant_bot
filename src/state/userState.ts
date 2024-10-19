const userStates: Map<string, boolean> = new Map();

export function setActiveState(userId: string, state: boolean) {
  userStates.set(userId, state);
}

export function getActiveState(userId: string): boolean {
  return userStates.get(userId) || false;
}
