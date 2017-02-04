var mongoose = require('mongoose')
const GpioUtil = require('../util/gpioUtil')
var Schema = mongoose.Schema

const deviceSchema = new Schema({
  pin: { type: Number, index: { unique: true } },
  name: String,
  group: { type: Schema.Types.ObjectId, ref: 'Group' }
})

deviceSchema.pre('remove', function (next) {
    console.log("remove PRE");
    let device = this;
    device.model('Group').update(
        { devices: device._id },
        { $pull: { devices: device._id } },
        { multi: true },
        next)
})

deviceSchema.pre('save', function(next) {
  console.log("save PRE");
  let device = this;
  if(device.group) {
    device.model('Group').update(
        { devices: device._id },
        { $pull: { devices: device._id } },
        { multi: true },
        next)
  } else next();
})

deviceSchema.post('save', async (doc) => {
  console.log("POST SAVE")
  if(doc.group) {
      let group = await doc.model('Group').findById(doc.group);
      GpioUtil.setStatus(doc.pin, group.status);
  }
  console.log(doc);
});


const Device = mongoose.model('Device', deviceSchema)
module.exports = Device
