# http-proxy

> 因为移动该死的内网限制而制作的工具

原理图：

<img src="https://raw.githubusercontent.com/zjhch123/http-proxy/master/doc/demo.png" width="600"/>

需要准备的：
1. 公网VPS服务器
2. 服务器上的Node环境(>=8.0)

主要功能还没有封装

## usage

```
// server:
node server -p 9999 -t 6789

// client:
node client.js -s 127.0.0.1:6789 -t 127.0.0.1:3000
```
