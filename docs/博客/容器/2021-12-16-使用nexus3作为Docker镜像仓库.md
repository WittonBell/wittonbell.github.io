# 一、在容器中安装运行nexus3
为了方便起见，这里使用脚本来处理安装运行。
在一个空目录中新建一个shell脚本文件，比如gen.sh，内容如下

```bash
# 所有操作在子目录中完成
mkdir -p output
cd output
# 创建辅助文件
echo subjectAltName=IP:192.168.1.8 > extfile.cnf
# 生成ca证书
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -days 10000 -out ca.crt
# 如果不想交互输入证书的国家，城市，公司名等等信息，可以在上面的命令加上参数：-subj "/CN=*"
# 生成server证书
openssl genrsa -out server.key 2048
openssl req -new -key server.key -subj "/CN=192.168.1.8" -out server.csr
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -extfile exefile.cnf -out server.crt -days 10000
# 将证书导出成pkcs格式
# 这里需要输入密码  输入“password”，如果不用这个，需要修改镜像里的${jetty.etc}/jetty-https.xml对应的password
openssl pkcs12 -export -out keystore.pkcs12 -inkey server.key -in server.crt
# 复制需要的文件到上层目录
cp keystore.pkcs12 ..
# 复制ca.crt到系统
sudo cp ca.crt /usr/local/share/ca-certificates/nexus3.crt
# 更新证书
sudo update-ca-certificates
# 删除辅助文件
rm extfile.cnf
cd ..

# 构建镜像
sudo podman build -t nexus3-https:v1 .
# 创建主机映射目录
sudo mkdir -p /nsd/nexus
sudo chown 200:200 /nsd/nexus -R
# 启动镜像
# 8433作为nexus3 web的https端口
# 8081作为nexus3 web的http端口
# 5051作为docker 本地仓库的端口
# 5052作为docker 代理的端口
sudo podman run -d --restart=always --rm -p 8443:8443 -p 8081:8081 -p 5051:5051 -p 5052:5052 --name nexus3 -v /nsd/nexus:/nexus-data nexus3-https:v1
```
此脚本中复制ca.crt到系统中的路径为ubuntu 21.10中的路径，其它版本的Linux会有一些差异。
ubuntu存放证书的目录有3个:

 1. /usr/local/share/ca-certificates
 2. /usr/share/ca-certificates
 3. /etc/ssl/certs

这三个的级别是越来越高，/etc/ssl/certs是系统级的，如果放在/etc/ssl/certs中则可以不用update-ca-certificates直接生效，其它的需要执行一次update-ca-certificates才会生效（update-ca-certificates其实就是创建链接到/etc/ssl/certs目录）。

然后执行gen.sh脚本：

```bash
sh gen.sh
```

```bash
witton@witton:~$ sh gen.sh 
Generating RSA private key, 2048 bit long modulus (2 primes)
...............+++++
........+++++
e is 65537 (0x010001)
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:SC
Locality Name (eg, city) []:Chengdu
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:witton
Email Address []:
Generating RSA private key, 2048 bit long modulus (2 primes)
................+++++
............................................................................................................+++++
e is 65537 (0x010001)
Signature ok
subject=CN = 192.168.1.8
Getting CA Private Key
Enter Export Password:
Verifying - Enter Export Password:
STEP 1: FROM sonatype/nexus3
STEP 2: USER root
--> 230c61ed869
STEP 3: COPY keystore.pkcs12 /keystore.pkcs12
--> 6bd0cde7bb0
STEP 4: RUN keytool -v -importkeystore -srckeystore keystore.pkcs12 -srcstoretype PKCS12 -destkeystore keystore.jks -deststoretype JKS -storepass password -srcstorepass password &&    cp keystore.jks /opt/sonatype/nexus/etc/ssl/
Importing keystore keystore.pkcs12 to keystore.jks...
Entry for alias 1 successfully imported.
Import command completed:  1 entries successfully imported, 0 entries failed or cancelled
[Storing keystore.jks]

Warning:
The JKS keystore uses a proprietary format. It is recommended to migrate to PKCS12 which is an industry standard format using "keytool -importkeystore -srckeystore keystore.jks -destkeystore keystore.jks -deststoretype pkcs12".
--> 09a616c01fb
STEP 5: USER nexus
STEP 6: COMMIT nexus3-https:v1
--> bfb74fa25b6
Successfully tagged localhost/nexus3-https:v1
bfb74fa25b6d15009a2a9b660dc3389e82fb924b92d3692dc9841706b9071c96
2b08d9a08a740243d7d398e00e36428c172041af9c1b689debae8905913b61db
```

运行成功了，就可以登录nexus系统了：
初始密码在容器的/nexus-data/admin.password中，也可以在主机对应的映射目录中查看。

![在这里插入图片描述](https://img-blog.csdnimg.cn/235231871a4e44908a0a82413fcdd3c2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_12,color_FFFFFF,t_70,g_se,x_16)

登录成功后，会要求修改密码：

![在这里插入图片描述](https://img-blog.csdnimg.cn/bd6f1667a83748e9a7342b0fdfd64b06.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

配置匿名用户的访问权限

![在这里插入图片描述](https://img-blog.csdnimg.cn/999181bc33cd484a9a966ecb0d7acc07.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/18737df8d365436392f20588bf65a56b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)
# 二、创建Docker镜像仓库
![在这里插入图片描述](https://img-blog.csdnimg.cn/0ff91fc298fd49b9b2f7a78354ba7c33.png)

这里选择Docker(hosted)创建本地Docker仓库：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2ee0f39469774409af3b56167c4c763f.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/5f0ea96ed93d44c6b6f8b3bc62b23d9e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

# 三、修改配置文件
修改容器路径/nexus-data/etc/nexus.properties，添加如下配置：

```bash
application-port-ssl=8433
nexus-args=${jetty.etc}/jetty.xml,${jetty.etc}/jetty-http.xml,${jetty.etc}/jetty-requestlog.xml,${jetty.etc}/jetty-https.xml
```
然后重启nexus容器
# 四、配置权限
## 1.配置Realms权限
如下图所示，将Docker Bearer Token Realm激活（移到右边并保存）

![在这里插入图片描述](https://img-blog.csdnimg.cn/4f5ce944c71845148b01647cf09a9700.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.创建角色
由于admin是完全的管理员权限，所以需要创建一个只能使用Docker权限的角色。

![在这里插入图片描述](https://img-blog.csdnimg.cn/d039459edcdd4ec188376b505935bb64.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

在下图所示，输入角色ID、角色名，描述，并将nx-repository-view-docker-*-权限移到右边，点击“Create Role"创建角色。

![在这里插入图片描述](https://img-blog.csdnimg.cn/5b45205fee064a798415ecedcc20fa6a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.创建用户
创建好角色后，就可以创建具有指定角色权限的用户了

![在这里插入图片描述](https://img-blog.csdnimg.cn/e76ab1c8e36146539ea0724886059fe8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

输入用户ID，名字，邮箱，密码，选择状态为Active，赋于用户刚才创建的角色（nx-docker），创建即可。

![在这里插入图片描述](https://img-blog.csdnimg.cn/6251c6511c2b4ffa84eab32abd6f082e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4.配置任务
镜像仓库在使用过程中会产生越来越多的无用的文件，为了及时清理掉这些文件，可以配置定时任务，定期进行不理。

![在这里插入图片描述](https://img-blog.csdnimg.cn/6acb041504924b74be48b7982abbec86.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

创建下图所示的两种Docker的清理任务：

![在这里插入图片描述](https://img-blog.csdnimg.cn/f0a585f3c3ad43ffb9debe3887ebe49f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

在任务频率上选择Daily，时间上选择一个合适的时间，比如０点。

![在这里插入图片描述](https://img-blog.csdnimg.cn/097cc4fb090841179613a74a5ba088e5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/d651b1c5e85948b2b66aa30226498359.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)


# 五、测试
## 1.登录

```bash
sudo podman login 192.168.1.8:5051
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/84718a18413e459db751fe9d0a8e4b13.png)
## 2.推送镜像
先查看镜像：

```bash
sudo podman images
```
再推送指定镜像：

```bash
sudo podman push a479c1e94f77 192.168.1.8:5051/nexus3-https:v1
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/51a390790f614b5f973390b3e7bc7e42.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)
## 3.查看nexus3仓库
![在这里插入图片描述](https://img-blog.csdnimg.cn/13211cb396934941a9e3f640b0aef5f6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/fa6239d207db48ff8cd5c6f90bd6564e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

# 六、设置Docker代理以及组
我们平常使用私有仓库的时候一般都使用一个端口来接受客户端的请求，nexus3可以添加docker group仓库，然后把docker hosted以及docker proxy整合起来作为后端服务。
## 1.添加Docker hosted（Docker本地）仓库
前面已经介绍过如何添加Docker hosted仓库，这里不再赘述，唯一需要说明的是端口可以不用设置为容器对外的端口，使用内部任意可用端口即可。

## 2.添加docker proxy（docker代理）
当Docker本地仓库不在要拉取的镜像时，会依次检测docker代理仓库中是否可以拉取。
在创建仓库时选择docker(proxy)即是创建Docker的代理仓库。

![在这里插入图片描述](https://img-blog.csdnimg.cn/f5f9184e59ed40bea1cf105814486847.png)

然后在创建仓库页面，填写好名字、端口、远程地址、Docker索引，添加证书，使用证书，如图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/182d7cf2027f486596ac57421df3f046.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

图中所示https://registry-1.docker.io为docker.io的远程的代理地址，索引要选择Use Docker Hub，https的端口与Docker hosted仓库一样，可以不用设置为容器对外的端口，使用内部任意可用端口即可。

由于docker.io是国外站点，访问比较慢，可以添加国内的镜像，比如中科大的：
```bash
https://docker.mirrors.ustc.edu.cn
```


![在这里插入图片描述](https://img-blog.csdnimg.cn/7806c6dde91348d191d237aaf0e904b2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

为了加快本地的拉取速度，nexus3可以将代理拉取回来的镜像缓存下来，方便后面快速拉取，需要勾选

```bash
Allow Nexus Repository Manager to download and cache foreign layers
```
如上图所示。

为了有更多的拉取源，还可以添加更新的docker代理，比如redhat的镜像库：
```bash
https://registry.access.redhat.com
```

## 3.添加Docker Group仓库
创建仓库时选择docker(Group)

![在这里插入图片描述](https://img-blog.csdnimg.cn/a4073abc97f844178a10f847656c973d.png)

然后在添加docker(Group)的界面把组成员库添加到成员列表中：

![在这里插入图片描述](https://img-blog.csdnimg.cn/d759d3e3c1094e6594f85925e86805d0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

Docker Group仓库作为Docker私有库的唯一对外接口，一定要使用容器对外的端口。

## 4.修改容器配置
设置好nexus3的私有仓库后，就可以修改容器的拉取地址了。
- podman
podman修改/etc/containers/registries.conf，添加：

```bash
[registries.search]
registries = ['192.168.1.8:5051']
```
- docker
ubuntu使用snap安装的docker修改/var/snap/docker/current/config/daemon.json，添加：
```bash
"insecure-registries":["192.168.1.8:5051"]
```
如果不是使用snap安装的，一般为/etc/docker/daemon.json。

参考链接：
https://www.jianshu.com/p/2117423c9811