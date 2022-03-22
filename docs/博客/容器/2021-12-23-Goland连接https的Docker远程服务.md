在前文[Goland使用远程容器进行go开发调试](docs/博客/容器/2021-12-21-Goland使用远程容器进行go开发调试.md)中介绍到为了让Goland能够远程调试Docker容器中的代码，需要在Docker服务中开启一个监听端口来接受远程服务。前文是简单粗暴地直接添加
```bash
-H tcp://0.0.0.0:2979
```
参数来达到目的的。这样做会有极大的安全问题，意味着任何人，只要知道Docker服务所在的IP地址及端口，即可以连接上来进行操作。要想避免此问题，增强安全性，需要改成使用安全传输层协议（TLS）进行传输并进行认证。
下面就介绍一下如何进行相关配置。
# 一、修改docker.service
还是修改/lib/systemd/system/docker.service，我们这里改一下端口，变为2379，在ExecStart语句最后添加如下参数：
```bash
-H tcp://0.0.0.0:2379 --tlsverify --tlscacert=/docker-ca/ca.pem --tlscert=/docker-ca/server-cert.pem --tlskey=/docker-ca/server-key.pem
```
其中/docker-ca为证书所在目录。
# 二、生成证书
为了方便证书的生成，这里我还是把生成证书的一系列命令写入一个脚本文件，比如build.sh，内容如下：

```bash
echo 创建CA证书私钥，需要输入两次密码
MYIP=192.168.1.8
openssl genrsa -aes256 -out ca-key.pem 4096
echo 根据私钥创建CA证书，输入上一步设置的私钥密码
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -subj "/CN=$MYIP" -out ca.pem
echo 创建服务端私钥
openssl genrsa -out server-key.pem 4096
echo 创建服务端证书签名请求文件，用于CA证书给服务端证书签名
openssl req -subj "/CN=$MYIP" -sha256 -new -key server-key.pem -out server.csr
echo 创建辅助文件
echo subjectAltName=DNS:$MYIP,IP:$MYIP > extfile.cnf
echo extendedKeyUsage = serverAuth >> extfile.cnf
echo 创建CA证书签名好的服务端证书，需要输入CA证书私钥密码
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile extfile.cnf



echo 创建客户端私钥
openssl genrsa -out key.pem 4096
echo 创建客户端证书签名请求文件，用于CA证书给客户证书签名
openssl req -subj "/CN=client" -new -key key.pem -out client.csr
echo 创建辅助文件
echo subjectAltName=IP:$MYIP > extfile-client.cnf
echo extendedKeyUsage = clientAuth > extfile-client.cnf
echo 创建CA证书签名好的客户端证书，需要输入CA证书私钥密码
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out cert.pem -extfile extfile-client.cnf
echo 删除创建过程中的中间文件
rm -rf ca.srl server.csr client.csr extfile.cnf extfile-client.cnf
#chmod -v 0444 ca.pem server-cert.pem cert.pem

echo 复制到docker认证目录
sudo rm /docker-ca -rf
sudo mkdir -p /docker-ca
sudo cp ca.pem cert.pem server-cert.pem server-key.pem /docker-ca/

echo 重启docker服务
sudo systemctl daemon-reload && systemctl restart docker
```

在使用的时候只需要修改一下MYIP变量即可。笔者的运行过程如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/35b9fd8e923140618916c085be133997.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

Docker服务启动成功后，把生成的ca.pem，cert.pem，key.pem三个文件复制到Goland所在主机上，比如d:\docker-ca目录。

# 三、Goland连接Docker
打开Goland的Docker连接窗口，在TCP套接字的引擎API URL中填写：

```bash
https://192.168.1.8:2379
```
证书文件夹，选择存放证书的d:\docker-ca目录，Goland会自动连接，连接成功与否下面会给出提示。如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/8d05d7b930284b1799627015a9ede1dc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

如果是命令行方式，使用如下命令格式：

```bash
docker --tlsverify \
    --tlscacert=ca.pem \
    --tlscert=cert.pem \
    --tlskey=key.pem \
    -H=$HOST:2376 version
```



参考链接：

https://docs.docker.com/engine/security/protect-access/