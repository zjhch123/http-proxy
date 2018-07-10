const net = require('net')

const r = /connection:\s*close/

const request = (ip, port) => {
  return (data) => {
    const raw = data.toLowerCase()
    if (raw.startsWith('get') && !r.test(raw)) {
      data = data.trim().split('\n')
      data.push('Connection: close')
      data = data.join('\n') + '\r\n\r\n'
    }
    return new Promise(resolve => {
      const c = net.connect(port, ip, function() {
        let retValue = ''
        c.on('data', (data) => {
          retValue += data.toString()
        })
        c.on('end', () => {
          resolve(retValue)
        })
        c.setKeepAlive(false)
        c.setEncoding('utf-8')
        c.setNoDelay(true)
        c.write(data)
      })
      c.setTimeout(10000, () => {
        resolve('HTTP 200 OK\r\nServer: zjh\r\n\r\ntimeout\r\n')
        c.destroy()
      })
    })
  }
}

// test

// ;(async () => {
//   const r = request('123.58.191.10', 80)
//   const res = await r('GET / HTTP/1.1\nHost: 123.58.191.10\nUser-Agent: curl\nAccept: */*')
//   console.log(res)
// })()

module.exports = request