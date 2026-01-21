export function daysUntil(expiryISO) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const expiry = new Date(expiryISO);
    expiry.setHours(0, 0, 0, 0);
  
    const diffMs = expiry - today;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }
  
  export function getExpiryStatus(expiryISO) {
    const d = daysUntil(expiryISO);
  
    if (d < 0) return { label: "Overdue", tone: "danger", days: d };
    if (d <= 2) return { label: "Expiring soon", tone: "warning", days: d };
    return { label: "OK", tone: "ok", days: d };
  }
  export function urgencyScore(expiryISO) {
    const status = getExpiryStatus(expiryISO);
  
    // Overdue items should come first (highest urgency)
    if (status.tone === "danger") return 1000 + Math.abs(status.days);
  
    // Expiring soon next
    if (status.tone === "warning") return 500 + (2 - status.days);
  
    // OK items last
    return 0;
  }
  export function suggestedAction(expiryISO) {
    const status = getExpiryStatus(expiryISO);
  
    if (status.tone === "danger") {
      return "Dispose / log waste";
    }
  
    if (status.tone === "warning") {
      return "Use first / apply discount";
    }
  
    return "Monitor";
  }
  