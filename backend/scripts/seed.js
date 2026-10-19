const { createStrapi } = require('@strapi/strapi');

const PERMISSIONS = [
  'api::track.track.find',
  'api::track.track.findOne',
  'api::album.album.find',
  'api::album.album.findOne',
  'api::artist.artist.find',
  'api::artist.artist.findOne',
  'api::genre.genre.find',
  'api::genre.genre.findOne',
  'api::follow.follow.create',
  'api::follow.follow.find',
  'api::follow.follow.findOne',
  'api::follow.follow.delete',
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.user.find',
  'plugin::users-permissions.user.findOne',
  'plugin::users-permissions.user.count',
  'plugin::users-permissions.user.updateMe',
  'plugin::users-permissions.auth.logout',
  'plugin::users-permissions.auth.getSessions',
  'plugin::users-permissions.auth.revokeSession',
  'plugin::users-permissions.auth.changePassword',
];

async function syncPermissions(strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
    populate: ['permissions'],
  });
  if (!role) {
    throw new Error('No se encontró el rol "authenticated"');
  }

  const existing = new Set(role.permissions.map((p) => p.action));
  const granted = [];
  for (const action of PERMISSIONS) {
    if (!existing.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
      granted.push(action);
    }
  }
  return granted;
}

async function main() {
  const strapi = createStrapi();
  await strapi.load();

  const granted = await syncPermissions(strapi);

  console.log('Seed de permisos completado:');
  console.log(`  Permisos  -> otorgados: ${granted.length}, ya existentes: ${PERMISSIONS.length - granted.length}`);

  await strapi.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
