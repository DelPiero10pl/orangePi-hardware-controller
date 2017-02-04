const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GpioUtil = require('../util/gpioUtil')

const groupSchema = new Schema({
  name: String,
  status: Number,
  devices: [{type: Schema.Types.ObjectId, ref: 'Device'}]
});

groupSchema.pre('remove', function(next) {
    const group = this;
    group.model('Device').update(
        { group: group._id },
        { $unset: { group: 1 } },
        { multi: true },
        next);
});

groupSchema.post('save', async function (doc) {
  console.log("POST SAVE")
  const group = this;
  if(doc.devices) {
      let tmp  = await group.model('Group').findById(doc._id).populate('devices').exec()
      tmp.devices.forEach(item => GpioUtil.setStatus(item.pin, doc.status));
  }
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
