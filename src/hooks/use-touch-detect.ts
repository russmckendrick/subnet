export function useTouchDetect(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
