const ApiError = require('./ApiError');

function apiErrorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.code).json({
      message: `${err.message} (Please contact me regarding this issue at stephenjusto24@gmail.com)`,
      statusCode: err.code
    });
  } return res.status(500).json({
    message: 'Internal Server Error (Please contact me regarding this issue at stephenjusto24@gmail.com)',
    statusCode: err.code
  });
}

module.exports = apiErrorHandler;