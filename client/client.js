const net = require('net');
const request = require('request');

const TARGET = '192.168.1.100';
const PORT = 9876;

const client = new net.Socket();


const r = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject([`HTTP/1.1 200 OK`, ``, `timeout`].join('\n'))
    }, 5000);
    const c = new net.Socket()
    c.connect(8997, '127.0.0.1')
    c.write(data)
    c.on('data', (recv) => {
      c.destroy()
      resolve(recv.toString())
    })
  })
}


client.connect(PORT, TARGET, function() {
  console.log('连接成功')
})


client.on('data', async (data) => {
  const raw = data.toString().split('\n')
  const key = raw[0]
  const body = raw.slice(1).join('\n')

  const retVal = await r(body)
  client.write(key + '\n' + retVal)
})
