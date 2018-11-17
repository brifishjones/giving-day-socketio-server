#!/usr/bin/env node
'use strict';
const fs = require('fs');
const https = require('https');
const port = 4443;
const options = {
    key: fs.readFileSync('/etc/apache2/ssl/server.key'),
    cert: fs.readFileSync('/etc/apache2/ssl/server.crt'),
    // on a production server ca: would be issued by a certificate authority such as letsencrypt.org
    // for this demo it is the same as cert:
    ca: fs.readFileSync('/etc/apache2/ssl/server.crt'),
    requestCert: true,
    rejectUnauthorized: false 
};
var connections = [];
var app = https.createServer(options); 
var io = require('socket.io')(app);
var prev_total = 15000;
var total = 15000;
var donors = 100; 
app.listen(port);
console.log('%s: server started ...', Date());
var timer = setInterval(function() {
  if (connections.length > 0) {
    fs.readFile('/var/tmp/giving-day-total.txt', 'ascii', function(err, content) {
      total = parseInt(content);
      if (total > 0 /* && total != prev_total */) {  // comment for demo only
        console.log("%s: total amount = $%s", Date(), total.toString());
        io.sockets.emit('update-totals', {total: total.toString()});  
        fs.readFile('/var/tmp/giving-day-challenge-totals.txt', 'ascii', function(err, content) {
          var myjson = JSON.stringify(content);
          var obj = JSON.parse(content);
          donors = obj['young-alumni']['donors'];  // get the number of donors for demo only
          io.sockets.emit('update-challenges', obj);  
        });
        fs.readFile('/var/tmp/giving-day-donors-by-state.txt', 'ascii', function(err, content) {
          var myjson = JSON.stringify(content);
          var obj = JSON.parse(content);
          io.sockets.emit('update-donors-by-state', obj);  
        });
      }
      prev_total = total;
    });
    // for this demo update totals 
    total = prev_total + Math.floor(Math.random() * 100) + 1;
    fs.writeFile('/var/tmp/giving-day-total.txt', total.toString() , function (err) {
      if (err) throw err;
    }); 
    // for this demo update young-alumni challenge totals 
    fs.writeFile('/var/tmp/giving-day-challenge-totals.txt', '{"young-alumni":  {"total":0, "donors":' + ((donors + 1) % 1000) + ', "challenge_amount":0, "challenge_donors":1000}}' , function (err) {
      if (err) throw err;
    });
    // for this demo update donors from each state totals 
    var states = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ]; 
    // assign a random donor number for each state to a state key
    var donorsbystate = states.reduce(function(st, val) { st[val] =  Math.floor(Math.random() * 3); ; return st; }, {}); 
    fs.writeFile('/var/tmp/giving-day-donors-by-state.txt', JSON.stringify(donorsbystate) , function (err) {
      if (err) throw err;
    }); 
  }
}, 15000);
io.on('connection', function (socket) {
  socket.once('disconnect', function() {
    connections.splice(connections.indexOf(socket), 1);
    console.log("%s: client id %s disconnected. (%s sockets remaining)", Date(), socket.id, connections.length);
    socket.disconnect();
  });
  connections.push(socket);
  console.log("%s: client id %s connected at ip %s. (%s sockets connected)", Date(), socket.id, socket.conn.remoteAddress, connections.length);
})
