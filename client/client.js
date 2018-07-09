const net = require('net');
const request = require('./request')

const TARGET = '127.0.0.1';
const PORT = 9876;

const client = new net.Socket();
client.setNoDelay(true)

const r = request('127.0.0.1', 3000)

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
  console.log('服务端连接成功')
})

client.on('data', async (data) => {
  console.log('---- 接收到来自服务端的消息: ----')
  const raw = data.toString().split('\n', 2)
  const key = raw[0]
  const body = raw[1]
  console.log(key)
  console.log(body)
  console.log('-----------------------------')
  const res = await r(body)
  sendData(0, 80, key, res, () => {
    client.write(key + '\n' + 'over!over')
    console.log('返回包发送完成')
  })
})
