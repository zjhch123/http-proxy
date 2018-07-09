const net = require('net')


new Promise((resolve) => {
  const server = net.createServer()
  server.on('connection', (socket) => {
    console.log('测试机连接成功')
    resolve(socket)
  })
  server.listen(9876, '0.0.0.0')
}).then((privateSocket) => {
  const public = net.createServer()
  console.log('开始监听连接')
  public.listen(6543)
  return { public: public, private: privateSocket }
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
    console.log(data.length)
    const raw = data.toString().split('\n', 2)
    const key = raw[0]
    const body = data.toString().split(key + '\n').join('')
    if (body === 'over!over' || body.indexOf('over!over') !== -1) {
      // console.log(publicSocketRet[key])
      if (body !== 'over!over') {
        publicSocketRet[key] += body.split('over!over')[0]
      }
      publicSocketPool[key] && publicSocketPool[key].end(publicSocketRet[key])
      
    } else {
      publicSocketRet[key] += body
    }
  })
})





