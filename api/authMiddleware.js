export default (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status('401').send({
      success: false,
      message: 'unauthenticated or unauthorized',
    });
  }
};
