var http = require('http').createServer(onRequest),
    url = require('url'),
    qs = require('querystring'),
    io = require('socket.io').listen(http),
    uuid = require('./uuid.js'),
    router = require('./router.js');

http.listen(80);

function onRequest(req, res) {

    var data = "";
    var path = url.parse(req.url, true).pathname;
    var param = qs.parse(url.parse(req.url, true).query);
    console.log("Request for " + path + " received.");
    req.setEncoding('utf8');
    req.addListener("data", function(postData) {
        data += postData;
        console.log("Received POST data chunk '" + postData + "'.");
    });
    req.addListener("end", function() {
        if (typeof data === 'string') {
            data = qs.parse(data);
        }
        router.router(req, res, path, param, data);
    });
}
var onlineUser = [];
onlineUser.remove = function(item) {
    this[this.indexOf(item)] = this[0];
    return this.shift();
};
io.sockets.on('connection', function(socket) {
    var newUser = {
        socket: socket,
        uuid: uuid.generateUUID(),
        name: 'anonymous-' + (onlineUser.length+1)
    };
    onlineUser.push(newUser);
    var users = [];
    for (var a = 0, l = onlineUser.length; a < l; a++) {
        users.push({
            uuid: onlineUser[a].uuid,
            name: onlineUser[a].name
        });
    }
    socket.emit('online', {
        onlineUser: users,
        myinfo:{
            name:newUser.name,
            uuid:newUser.uuid
        }
    });
    socket.on('message', function(data) {
        this.broadcast.emit('message',data);
    });
    socket.on('disconnect', function() {
        //广播下线用户的uuid
        this.broadcast.emit('broadcast', {
            type: 'user offline',
            uuid: onlineUser.remove(this).uuid
        });
    });
    socket.broadcast.emit('broadcast', {
        type: 'user online',
        user: {
            uuid: newUser.uuid,
            name: newUser.name
        }
    });
});

