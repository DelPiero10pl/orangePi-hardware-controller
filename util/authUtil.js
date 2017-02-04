const RouteUtil = require('./routeUtil')
class AuthUtil {
  static requireAdmin(payload, res) {
      if(payload.acountType !== 'Admin')
        RouteUtil.statusResponse (403, res);
  }
}

module.exports = AuthUtil;
