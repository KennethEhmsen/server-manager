/**
 * server.js - Renderer side Server instance
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
const ipcRenderer = require('electron').ipcRenderer;

/**
 * Server instance
 * 
 * @param {String} name
 * @param {Function} cb
 */

var cbs = {};
var servers = {}

// When we receive the server
ipcRenderer.on("sendServer", function(event, server) {
    servers[server.name].isStarted = server.isStarted;
    servers[server.name].players = server.players;
    servers[server.name].log = server.log;
    servers[server.name].settings = server.settings;
    cbs[server.name](servers[server.name]);
});

// Real server instance.
var Server = function(name) {
    this.name = name;
    this.isStarted = false;
    this.players = [];
    this.log = "";
    this.commands = [];
    this.settings = [];
    this.start = function() {
        this.isStarted = true;
    };
    this.stop = function() {
        this.commands.push("stop");
    };
    this.insertCommand = function(cmd) {
        this.commands.push(cmd);
    }
    this.send = function() {
        exports.setServer(this);
    }
}

/**
 * Gets a server
 * 
 * @param {String} name
 * @param {Function} cb
 */
exports.getServer = function(name, cb) {
    // Saving callback
    cbs[name] = cb;
    ipcRenderer.send("getServer", name);

    servers[name] = new Server(name);
}

/**
 * Exports a server
 * 
 * @param {Server} server
 */
exports.setServer = function(server) {
    ipcRenderer.send("setServer", server);
}