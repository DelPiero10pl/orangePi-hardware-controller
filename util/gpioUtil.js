const wpi = require('wiring-op')

class GpioUtil {

  static off(pin) {
    wpi.pinMode(pin, wpi.OUTPUT)
    wpi.digitalWrite(pin, 1)
    return 0
  }

  static on(pin) {
    wpi.pinMode(pin, wpi.OUTPUT)
    wpi.digitalWrite(pin, 0)
    return 1
  }

  static setStatus(pin, status) {
    let locStatus = +!parseInt(status);
    wpi.pinMode(pin, wpi.OUTPUT)
    wpi.digitalWrite(pin, locStatus)
    return locStatus
  }

  static getStatus(pin) {
      return +!wpi.digitalRead(parseInt(pin));
  }

}

module.exports = GpioUtil;
