var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const deviceSchema = new Schema({
  pin: { type: Number, index: { unique: true } },
  name: String,
  group: { type: Schema.Types.ObjectId, ref: 'Group' }
});


const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
