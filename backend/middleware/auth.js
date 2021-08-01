const expressJwt = require('express-jwt');

const authJwt = () => {
    const secret = process.env.JWT_SECRET;
    const api = process.env.API_URL;

    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked
    }).unless({
        path: [
            // {
            //     url: `${api}/users/login`,
            //     methods: [
            //         'POST'
            //     ]
            // },
            // {
            //     url: `${api}/users/register`,
            //     methods: [
            //         'POST'
            //     ]
            // },
            // {
            //     url: /\/public\/uploads(.*)/,
            //     methods: [
            //         'GET',
            //         'OPTIONS'
            //     ]
            // },
            // {
            //     url: /\/api\/v1\/products(.*)/,
            //     methods: [
            //         'GET',
            //         'OPTIONS'
            //     ]
            // },
            // {
            //     url: /\/api\/v1\/categories(.*)/,
            //     methods: [
            //         'GET',
            //         'OPTIONS'
            //     ]
            // },
            { url: /(.*)/ }
        ]
    });
};

const isRevoked = async (req, { isAdmin }, done) => {
    if (! isAdmin) {
        done(null, true);
    }

    done();
};

module.exports = {
    authJwt
};
