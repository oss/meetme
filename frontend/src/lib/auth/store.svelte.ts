export type User = {
  name: string,
  netid: string
};

class AuthStore {
  user = $state<User | null>(null);
  loading = $state(false);

  get get() {
    return this.user;
  }

  get isLoading() {
    return this.loading;
  }

  get authenticated() {
    return this.user !== null;
  }

  set(user: User) {
    this.user = user;
  }

  clear() {
    this.user = null;
  }

  setLoading(bool: boolean) {
    this.loading = bool;
  }
}

export const authstore = new AuthStore();
