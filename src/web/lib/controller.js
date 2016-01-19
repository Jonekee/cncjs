import _ from 'lodash';
import pubsub from 'pubsub-js';
import socket from './socket';

class CNCController {
    port = '';
    callbacks = {
        'serialport:list': [],
        'serialport:open': [],
        'serialport:close': [],
        'serialport:error': [],
        'serialport:read': [],
        'serialport:write': [],
        'grbl:status': [],
        'grbl:parserstate': []
    };

    constructor() {
        pubsub.subscribe('port', (msg, port) => {
            this.port = port || this.port;
        });

        Object.keys(this.callbacks).forEach((eventName) => {
            socket.on(eventName, function() {
                let args = Array.prototype.slice.call(arguments);
                this.callbacks[eventName].forEach((callback) => {
                    callback.apply(callback, args);
                });
            }.bind(this));
        });
    }
    on(eventName, callback) {
        let callbacks = this.callbacks[eventName];
        if (_.isArray(callbacks) && _.isFunction(callback)) {
            callbacks.push(callback);
        }
    }
    off(eventName, callback) {
        let callbacks = this.callbacks[eventName];
        if (_.isArray(callbacks) && _.isFunction(callback)) {
            callbacks.splice(callbacks.indexOf(callback), 1);
        }
    }
    openPort(port, baudrate) {
        socket.emit('open', port, baudrate);
    }
    closePort(port) {
        socket.emit('close', port);
    }
    listAllPorts() {
        socket.emit('list');
    }
    command(cmd) {
        let { port } = this;
        if (!port) {
            return;
        }
        socket.emit('command', port, cmd);
    }
    write(data) {
        let { port } = this;
        if (!port) {
            return;
        }
        socket.emit('write', port, data);
    }
    writeln(data) {
        data = ('' + data).trim() + '\n';
        this.write(data);
    }
}

const controller = new CNCController();

export default controller;
