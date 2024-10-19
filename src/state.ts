let isActive: boolean = false;

export function setActiveState(state: boolean) {
  isActive = state;
}

export function getActiveState(): boolean {
  return isActive;
}
