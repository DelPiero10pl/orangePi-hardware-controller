const request = require('request');

const dataConsumer = function (socket) {

setInterval(function () {

  request('https://elektrownia-jack-carter.c9users.io', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      socket.emit('news', body);
      console.log(body) // Print the google web page.
    }
  })


}, 1000);


  socket.on('my other event', function (data) {
    console.log(data);
  });

};


module.exports = dataConsumer;
