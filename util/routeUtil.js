RouteUtil = {};

RouteUtil.errResponse = function(status, msg, res) {
  res.status(status);
  res.json({err: status, msg: msg});
}

module.exports = RouteUtil;
