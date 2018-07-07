const net = require('net')

let clientSocket = null
const server = net.createServer()

server.on('connection', (socket) => {
  console.log('客户端连接成功')
  clientSocket = socket
  socket.on('data', (data) => {
    const raw = data.toString().split('\n')
    const key = raw[0]
    const body = raw.slice(1).join('\n')
    publicSocket[key] && publicSocket[key].write(body)
  })
})
server.listen(9876, '0.0.0.0')

let publicSocket = {}
const public = net.createServer()
public.on('connection', (socket) => {
  console.log('接收到请求')
  const key = Math.random().toString(36).substr(2)
  ;(function(key) {
    publicSocket[key] = socket
    publicSocket[key].on('data', (data) => {
      clientSocket && clientSocket.write(key + '\n' + data)
    })
    publicSocket[key].on('close', () => {
      delete publicSocket[key]
    })
  })(key)
})
public.listen(65432, '0.0.0.0')