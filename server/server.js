const net = require('net')


new Promise((resolve) => {
  const server = net.createServer()
  server.on('connection', (socket) => {
    console.log('测试机连接成功')
    socket.setNoDelay(true)
    resolve(socket)
  })
  server.listen(9876, '0.0.0.0')
}).then((privateSocket) => {
  const public = net.createServer()
  console.log('开始监听连接')
  public.listen(6543)
  return { public, private: privateSocket }
}).then(({ public, private: privateSocket }) => {
  const publicSocketPool = {}
  const publicSocketRet = {}
  public.on('connection', (publicSocket) => {
    const key = Math.random().toString(36).substr(2)
    console.log('收到请求:' + key)
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
    console.log('----')
    console.log(body)
    console.log('----')
    publicSocketRet[key] += body

    if (publicSocketRet[key].endsWith('over!over')) {
      console.log('请求结束:' + key)
      publicSocketRet[key] = publicSocketRet[key].split(key + '\n').join('').replace('over!over', '')
      publicSocketPool[key] && publicSocketPool[key].end(publicSocketRet[key])
    }
  })
})





