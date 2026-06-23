// Do not use interface Notification, that overrides a built-in type
interface Notif {
  id: number;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

class NotifStore {
  private _notifications = $state<Notif[]>([]);

  get notifications() {
    return this._notifications;
  }

  send(notif: Notif, duration = 3000) {
    this._notifications.push(notif);

    setTimeout(() => {
      this._notifications = this._notifications.filter(n => n.id !== notif.id);
    }, duration);
  }

  info(message: string) {
    const notif: Notif = {
      id: Date.now(),
      message: `Info: ${message}`,
      type: "info"
    };
    this.send(notif);
  }

  success(message: string) {
    const notif: Notif = {
      id: Date.now(),
      message: `Success: ${message}`,
      type: "success"
    };
    this.send(notif);
  }

  warning(message: string) {
    const notif: Notif = {
      id: Date.now(),
      message: `Warning: ${message}`,
      type: "warning"
    };
    this.send(notif, 7000);
  }

  error(message: string) {
    const notif: Notif = {
      id: Date.now(),
      message: `Error: ${message}`,
      type: "error"
    };
    this.send(notif, 10000);
  }
}

export const notifstore = new NotifStore();
