'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const toId = (value) => {
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (Array.isArray(value)) return toId(value[0]);
  if (typeof value === 'object') {
    if ('set' in value) return toId(value.set);
    if ('connect' in value) return toId(value.connect);
    if ('id' in value) return value.id;
  }
  return null;
};

module.exports = createCoreController('api::follow.follow', ({ strapi }) => ({
  async create(ctx) {
    const currentUserId = ctx.state.user?.id;

    if (!currentUserId) {
      return ctx.badRequest('No se pudo identificar al usuario autenticado');
    }

    const followingId = toId(ctx.request.body?.data?.following);

    if (followingId == null) {
      return ctx.badRequest('El campo "following" es obligatorio');
    }

    if (String(followingId) === String(currentUserId)) {
      return ctx.badRequest('No podés seguirte a vos mismo');
    }

    ctx.request.body = {
      data: {
        follower: { set: currentUserId },
        following: { set: followingId },
      },
    };

    return super.create(ctx);
  },
}));