'use strict';

module.exports = (plugin) => {
  const attributes = plugin.contentTypes.user.schema.attributes;

  attributes.bio = {
    type: 'text',
  };

  attributes.avatar = {
    type: 'text',
  };

  plugin.controllers.user.updateMe = async (ctx) => {
    const currentUser = ctx.state.user;

    if (!currentUser) {
      return ctx.unauthorized('Debes iniciar sesión para editar tu perfil');
    }

    const allowedFields = ['username', 'bio', 'avatar'];
    const data = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(ctx.request.body, field)) {
        data[field] = ctx.request.body[field];
      }
    }

    if ('username' in data) {
      const service = strapi.plugin('users-permissions').service('user');
      const userWithSameUsername = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { username: data.username } });

      if (userWithSameUsername && userWithSameUsername.id !== currentUser.id) {
        return ctx.badRequest('El nombre de usuario ya está en uso');
      }
    }

    const userService = strapi.plugin('users-permissions').service('user');
    const updated = await userService.edit(currentUser.id, data);

    if (!updated) {
      return ctx.notFound('Usuario no encontrado');
    }

    const schema = strapi.getModel('plugin::users-permissions.user');
    ctx.body = await strapi.contentAPI.sanitize.output(updated, schema, {
      auth: ctx.state.auth,
    });
  };

  plugin.routes['content-api'].routes.push({
    method: 'PUT',
    path: '/user/me',
    handler: 'user.updateMe',
    config: {
      prefix: '',
      policies: [],
    },
  });

  return plugin;
};