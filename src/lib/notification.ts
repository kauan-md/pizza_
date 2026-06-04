export function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1108, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // Web Audio API not available
  }
}

export function getNewOrderCount(): number {
  try {
    return Number(localStorage.getItem("admin_new_orders") || "0");
  } catch {
    return 0;
  }
}

export function incrementNewOrderCount() {
  try {
    const count = getNewOrderCount() + 1;
    localStorage.setItem("admin_new_orders", String(count));
    window.dispatchEvent(new Event("storage"));
  } catch { /* ignore */ }
}

export function clearNewOrderCount() {
  try {
    localStorage.setItem("admin_new_orders", "0");
    window.dispatchEvent(new Event("storage"));
  } catch { /* ignore */ }
}
