"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const wss = new ws_1.default.Server({ port: 8080 });
const clients = [];
wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.push(ws);
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        clients.forEach(client => {
            if (client !== ws && client.readyState === ws_1.default.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.splice(clients.indexOf(ws), 1);
    });
});
console.log('WebSocket IRC server started on port 8080');
