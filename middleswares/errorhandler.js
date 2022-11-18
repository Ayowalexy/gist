module.exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

module.exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    status: "error",
    message: 'invalid request',
    meta: {
      error: err.message
    },
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}

