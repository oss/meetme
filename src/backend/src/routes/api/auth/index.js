const UserService = require("../user-service");

export default async function auth(fastify, _opts) {
  const { authorize } = fastify;

  await fastify.get("/login/callback", async function (request, reply) {
    const token = await this.cas.getaccesstokenfromauthorizationcodeflow(request);
    const user = await this.cas.userinfo(token.token);
    await UserService.updateLastLogin(user.netid);
    // TODO: use fastify-session instead?
    reply.setCookie("user_session", token.token, {
      secure: this.config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: true,
      path: "/api/auth",
      signed: true,
      maxAge: 604800,
      expires: new Date(Date.now() + 604800 * 1000),
    });

    return reply.redirect("/");
  });

  await fastify.route({
    method: "DELETE",
    path: "/logout",
    onRequest: authorize,
    schema: {
      description: "Log out of the current user session",
      response: { 204: S.object() },
    },
    handler: onLogout,
  });

  async function onLogout(request, reply) {
    request.user = null;
    reply.clearCookie("user_session", { path: "/api/auth" });
    reply.code(204);
  }

  await fastify.route({
    method: "GET",
    path: "/whoami",
    onRequest: authorize,
    schema: {
      description: "Gets the current user session",
    },
    handler: onWhoami,
  });

  async function onWhoami(request, _reply) {
    return { user: request.user };
  }
}
