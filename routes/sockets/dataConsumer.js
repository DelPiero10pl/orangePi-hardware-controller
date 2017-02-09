const request = require('request');
const Message = require('../../models/message');
const dataConsumer = function (socket) {
console.log("hello");
  makeRequest()

  setInterval(makeRequest, 90000);


  socket.on('my other event', function (data) {
    console.log(data);
  });
//https://elektrownia-jack-carter.c9users.io
  function makeRequest() {
    request('http://localhost:8080', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body)
        const msg = new Message({requestType: json.request, updateTime: new Date(json.update_time)})
        msg.save((err)=> {
          Message.findOne().sort({_id: -1}).exec((err,obj)=> {
            //console.log(obj);
            if(obj.decision==='NODECISION')
              socket.emit('news', obj)
          })
        });
      } else console.log("ERR", error);
    })
  }
};

module.exports = dataConsumer;
