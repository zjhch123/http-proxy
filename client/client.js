const net = require('net');
const request = require('./request')
const program = require('commander');


program
  .option('-s, --server <ip:port>', 'server ip addr')
  .option('-t, --to <ip:port>', 'proxy to ip addr')
  .parse(process.argv)


const TARGET_PORT = program.server || '127.0.0.1:6543'
const PROXY_PORT = program.to || '127.0.0.1:8000'

const TARGET = TARGET_PORT.split(':')[0];
const PORT = TARGET_PORT.split(':')[1];

const client = new net.Socket();

const r = request(PROXY_PORT.split(':')[0], PROXY_PORT.split(':')[1])

const sendData = (startIndex, step, key, data, finishCb) => {
  const packet = data.slice(startIndex, startIndex + step)
  client.write(key + '\n' + packet, () => {
    startIndex += step
    if (startIndex > data.length) {
      finishCb()
    } else {
      sendData(startIndex, step, key, data, finishCb)
    }
  })
}

client.connect(PORT, TARGET, function() {
  client.setNoDelay(true)
  console.log('服务端连接成功')
})

client.on('data', async (data) => {
  console.log('---- 接收到来自服务端的消息: ----')
  const raw = data.toString().split('\n')
  const key = raw[0]
  const body = raw.slice(1).join('\n')
  console.log('key:' + key)
  console.log('body:')
  console.log(body)
  console.log('-----------------------------')
  const res = await r(body)
  // console.log(res)
  sendData(0, 80, key, res, () => {
    client.write(key + '\n' + 'over!over')
    console.log('返回包发送完成')
  })
})
