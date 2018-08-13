import socketCluster from 'socketcluster-client';
import { Config } from './../../config';

export default class BaseWebsocket {
    constructor() {
        this.namespace = Config.SOCKET.namespace;
        this.socket = socketCluster.connect(Config.SOCKET);
    }

    on(action, callback) {
        return this.socket.on(`${this.namespace}'_'${action}`, callback);
    }

    emit(action, data, callback) {
        if (callback) {
            return this.socket.emit(`${this.namespace}'_'${action}`, data, callback);
        } else {
            return this.socket.emit(`${this.namespace}'_'${action}`, data);
        }
    }

    subscribe(action) {
        return this.socket.subscribe(`${this.namespace}'_'${action}`);
    }

    unsubscribe(action) {
        return this.socket.unsubscribe(`${this.namespace}'_'${action}`);
    }

    watch(channel, callback) {
        return channel.watch(callback);
    }

    unwatch(action, callback) {
        return this.socket.unwatch(`${this.namespace}'_'${action}`, callback);
    }

    // many sockets
    subscribeList(events, callback) {
        for (let event of events) {
            const chanel = this.socket.subscribe(event);
            this.watch(chanel, responses => {
                callback(responses, event);
            });
        }
    }

    unsubscribeList(events) {
        for (let event of events) {
            this.unsubscribe(event);
            this.unwatch(event);
        }
    }
}
