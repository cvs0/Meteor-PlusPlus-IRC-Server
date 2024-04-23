import WebSocket from 'ws';
import fetch from 'node-fetch';

const wss = new WebSocket.Server({ port: 8080 });
const clients: WebSocket[] = [];

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');
  clients.push(ws);

  ws.on('message', async (message: string) => {
    console.log(`Received message: ${message}`);
    
    // Parse the message to extract the username and UUID
    const parts = message.split(';');
    if (parts.length >= 3) {
      let username = parts[0];
      const uuid = parts[1];
      const actualMessage = parts.slice(2).join(';');
      
      console.log(`Username: ${username}`);
      console.log(`UUID: ${uuid}`);
      console.log(`Actual Message: ${actualMessage}`);
      
      // Check if the user is an admin
      const isAdmin = await checkAdmin(uuid);
      
      // Determine the role
      let role = isAdmin ? '[ADMIN]' : '[USER]';
      
      // Check if the username is 'cvs0'
      if (username.toLowerCase() === 'cvs0') {
        role = '[OWNER]';
      }
      
      // Send the message with the role to all clients
      clients.forEach(client => {
        client.send(`${role} ${username}: ${actualMessage}`);
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

async function checkAdmin(uuid: string): Promise<boolean> {
  try {
    const response = await fetch(`https://meteor.cvs0.xyz/api/users/isAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uuid }),
    });

    const data = await response.json();
    const isAdmin: boolean = (data as { isAdmin: boolean }).isAdmin;
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

console.log('WebSocket server started on port 8080');
