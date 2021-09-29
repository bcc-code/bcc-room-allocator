module.exports = function registerHook({ services, exceptions }) {
    const { UsersService } = services;
    const { ForbiddenException } = exceptions;

    return {
        'oauth.auth0.login.before': async function (payload, { schema, database }) {
            const { profile, access_token } = payload

            if (access_token && profile.email) {
                try {
                    const service = new UsersService({ schema, knex: database });
                    await service.createOne({
                        id: profile['https://login.bcc.no/claims/personId'],
                        first_name: profile.given_name,
                        last_name: profile.family_name,
                        location: profile.locale,
                        email: profile.email,
                        password: Date.now(),
                        // role: process.env.GROUP_ADMIN,
                        status: 'active'
                    });
                } catch (err) {
                    console.log(err)
                    // Ignore RecordNotUniqueException errors
                }
            } else throw new ForbiddenException();
        }
    };
};