var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var _ = require('lodash');

var url = new URL(location.href);
var params = url.searchParams;


var options = {};
var isTeacher = params.get('teacher');
if (isTeacher) {
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.arc(100, 75, 50, 0, 2 * Math.PI);
  ctx.stroke();
  options.initiator = true;
  options.stream = c.captureStream();
}

var hub = signalhub('teacher-example', ['https://signalhub-jccqtwhdwc.now.sh'])
var sw = swarm(hub, options);
hub.broadcast('teacher-example', {hello: 'world'})

sw.on('peer', function (peer, id) {
  options;
  console.log('connected to a new peer:', id);
  console.log('total peers:', sw.peers.length);
})

sw.on('disconnect', function (peer, id) {
  console.log('disconnected from a peer:', id);
  console.log('total peers:', sw.peers.length);
})

window.sw = sw;
