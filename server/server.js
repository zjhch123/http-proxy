const program = require('commander');
const net = require('net')


program
  .option('-p, --public <port>', 'public listen')
  .option('-t, --to <port>', 'proxy to listen')
  .parse(process.argv)

const PUBLIC_PORT = program.public || 9877
const PRIVATE_PORT = program.to || 6543

const recvRequestLog = (key) => {
  console.log('收到请求:')
  console.log(` - key: ${key}`)
}
const endRequestLog = (key) => {
  console.log('请求结束:')
  console.log(` - key: ${key}`)
}

new Promise((resolve) => {
  const server = net.createServer()
  console.log(`等待测试机连接，端口: ${PRIVATE_PORT}`)
  server.on('connection', (socket) => {
    console.log('测试机连接成功')
    socket.setNoDelay(true)
    resolve(socket)
  })
  server.listen(PRIVATE_PORT)
}).then((privateSocket) => {
  const public = net.createServer()
  console.log(`开始监听端口: ${PUBLIC_PORT}`)
  public.listen(PUBLIC_PORT)
  return { public, private: privateSocket }
}).then(({ public, private: privateSocket }) => {
  const publicSocketPool = {}
  const publicSocketRet = {}
  public.on('connection', (publicSocket) => {
    const key = Math.random().toString(36).substr(2)
    recvRequestLog(key)
    ;((key) => {
      publicSocketPool[key] = publicSocket
      publicSocketRet[key] = ''
      publicSocket.on('data', (data) => {
        privateSocket.write(key + '\n' + data.toString())
      })  
      publicSocket.on('error', (e) => {
        publicSocket.end()
      })
      publicSocket.on('end', () => {
        delete publicSocketPool[key]
      })
    })(key)

  })
  privateSocket.on('data', (data) => {
    const raw = data.toString().split('\n')
    const key = raw[0]
    const body = raw.slice(1).join('\n')
    // console.log('----')
    // console.log(body)
    // console.log('----')
    publicSocketRet[key] += body

    if (publicSocketRet[key].endsWith('over!over')) {
      endRequestLog(key)
      publicSocketRet[key] = publicSocketRet[key].split(key + '\n').join('').replace('over!over', '')
      publicSocketPool[key] && publicSocketPool[key].end(publicSocketRet[key])
    }
  })
})





