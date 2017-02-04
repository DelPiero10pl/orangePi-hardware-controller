const codeMsg = []
codeMsg[200] = 'Ok'
codeMsg[201] = 'Created'
codeMsg[204] = 'No Content'
codeMsg[304] = 'Not Modified'
codeMsg[400] = 'Bad Request'
codeMsg[401] = 'Unauthorized'
codeMsg[403] = 'Forbidden'
codeMsg[404] = 'Not Found'
codeMsg[409] = 'Conflict'
codeMsg[500] = 'Internal Server Error'

class RouteUtil {
  static statusResponse (status, res) {
    res.status(status).json({err: status, msg: codeMsg[status]});
  }
}

module.exports = RouteUtil;
