import { goto } from "$app/navigation";

export type User = {
  name: string,
  netid: string
};

class AuthStore {
  private _user = $state<User | null>(null);
  private _loading = $state(false);

  get user() {
    return this._user;
  }

  get loading() {
    return this._loading;
  }

  get authenticated() {
    return this.user !== null;
  }

  async authenticate(redirect: boolean) {
    if (this.authenticated) {
      return true;
    }

    try {
      this._loading = true;
      const res = await fetch("/api/auth/whoami");
      if (!res.ok) {
        throw new Error("Unable to authenticate");
      }
      const json = await res.json();
      this._user = json.user;
      this._loading = false
      return true
    } catch (error) {
      this._loading = false;
      this._user = null;
      if (redirect) {
        goto("/");
      }
      return false;
    }
  }

  clear() {
    this._user = null;
  }
}

export const authstore = new AuthStore();
