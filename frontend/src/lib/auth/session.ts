import { authstore } from "$lib/auth/store.svelte.js";
import { goto } from "$app/navigation";

export async function authenticate(redirect: boolean) {
  if (authstore.authenticated) {
    return true;
  }

  try {
    authstore.setLoading(true);
    const res = await fetch("/api/auth/whoami");
    if (!res.ok) {
      throw new Error("Unable to authenticate");
    }
    const json = await res.json();
    authstore.set(json.user);
    authstore.setLoading(false);
    return true
  } catch (error) {
    authstore.setLoading(false);
    authstore.clear();
    if (redirect) {
      goto("/");
    }
    return false;
  }
}
