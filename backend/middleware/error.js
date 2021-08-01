const errorHandler = (err, req, res, next) => {
    if (err && err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: "The user is not authorized"
        });
    }

    if (err && err.name === 'ValidationError') {
        return res.status(422).json({
            message: err
        });
    }

    return res.status(500).json({
       error: err
    });
};

module.exports = {
    errorHandler
};
