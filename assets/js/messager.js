(function(exports) {
    ko.bindingHandlers.broadcast = {
        update: function(element, valueAccessor, allBindingsAccessor) {
            var messagesArray = valueAccessor()();
            var length = messagesArray.length;
            if (messagesArray[0] && messagesArray[length-1].type === 'recieve') {
                element.innerText = messagesArray[length-1].name+':'+messagesArray[length-1].content;
            }
        }
    };
    var socket = io.connect(document.domain);
    socket.on('connect', function() {
        console.log('connected');
    });
    socket.on('online', function(data) {
        messager.base.onlineUser.removeAll();
        for (var i = 0, l = data.onlineUser.length; i < l; i++) {
            messager.base.onlineUser.push(data.onlineUser[i]);
        }
        messager.base.localName(data.myinfo.name);
        messager.base.localUUID = data.myinfo.uuid;
    });
    socket.on('broadcast', function(data) {
        switch (data.type) {
        case 'user online':
            self.messager.base.onlineUser.push(data);
            break;
        case 'change name':
            break;
        case 'user offline':
            messager.base.onlineUser.remove(function(item) {
                return item.uuid === data.uuid;
            });
            break;
        }
    });
    socket.on('message', function(data) {
        messager.base.messageData.push(data);
    });

    function Messager() {
        var self = this;
        self.base = {
            messageData: ko.observableArray(),
            localName: ko.observable(),
            LocalUUID: '',
            onlineUser: ko.observableArray(),
            status: ko.observable('close') //open or close
        };
        self.submitMessage = function(item, event) {
            if (event.keyCode === 13) {
                var message = document.getElementById('message-inputbox').value;
                var messageData = {
                    from: self.base.localName(),
                    time: self.getTime(),
                    content: message,
                    type: 'recieve'
                };
                socket.emit('message', messageData);
                messageData.type = 'send';
                messageData.from = 'Me';
                self.base.messageData.push(messageData);
                event.target.value = "";
            }
        };
        self.toggleMessager = function() {
            if (self.base.status() === 'open') {
                self.base.status('close');
            } else {
                self.base.status('open');
            }
        }, self.getTime = function() {
            var time = new Date();
            return [time.getFullYear(), '-', time.getMonth() + 1, '-', time.getDate(), ' ', time.getHours(), ':', time.getMinutes(), ':', time.getSeconds()].join('');
        };
    }
    var messager = new Messager();
    exports.messager = messager;
    ko.applyBindings(exports.messager);
})(window);

