'use strict';

const { createCoreService } = require('@strapi/strapi').factories;
const { errors } = require('@strapi/utils');

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

module.exports = createCoreService('api::follow.follow', ({ strapi }) => ({
  async create(params = {}) {
    const data = params?.data ?? {};
    const followerId = toId(data.follower);
    const followingId = toId(data.following);

    if (followerId != null && followingId != null) {
      const existing = await super.find({
        fields: ['id'],
        filters: {
          $and: [
            { follower: { id: { $eq: followerId } } },
            { following: { id: { $eq: followingId } } },
          ],
        },
      });

      if (existing.results.length > 0) {
        throw new errors.ApplicationError('Ya estás siguiendo a este usuario');
      }
    }

    return super.create(params);
  },
}));