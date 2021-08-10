---
layout: post
title:  "Open vSwitch的安装与运行"
date:    2020-06-17 17:38:11 +0800
categories: Linux
tags: [Open vSwitch, 安装, 运行]
---
* content
{:toc}

# 一、下载安装包
在http://www.openvswitch.org/download/中下载想要安装的版本
![在这里插入图片描述]({{ site.imgurl }}Openv Switch的安装与运行/openvswitchdownload_2020061716490816.png)
笔者下载的是最新的[openvswitch-2.12.0.tar.gz](https://www.openvswitch.org/releases/openvswitch-2.12.0.tar.gz)
# 二、安装
## 1. 解压、生成Makefile、编译、安装
```bash
tar zxvf openvswitch-2.12.0.tar.gz
cd openvswitch-2.12.0
./configure 
make -j4
sudo make install
```
以上是正常的编译安装流程。
还有一种配置方式，即编译成内核模块：
```bash
./configure -with-linux=/lib/modules/$(uname -r)/build
```

## 2. 如果在安装的过程中生成了修改了内核模块，那么重新编译内核。
```bash
sudo make modules_install
```
![在这里插入图片描述]({{ site.imgurl }}Openv Switch的安装与运行/openvswitchconsole_2020061716582969.png)

## 3. 将openvswitch模块载入到内核中
```bash
sudo modprobe openvswitch 
```
可以通过下面的命令来验证是否成功
```bash
sudo lsmod | grep openvswitch
```
![在这里插入图片描述]({{ site.imgurl }}Openv Switch的安装与运行/openvswitchconsole1_20200617170456526.png)



# 三、运行
openvswitch有几个脚本放在/usr/local/share/openvswitch/scripts下，为了方便使用，可以设置PATH路径。由于运行需要root权限，可以切换到root，再设置PATH。
```bash
export PATH=$PATH:/usr/local/share/openvswitch/scripts
ovs-ctl start 
```
![在这里插入图片描述]({{ site.imgurl }}Openv Switch的安装与运行/openvswitchconsole2_20200617171526781.png)
```bash
system ID not configured, please use --system-id ... failed!
```
这里有一个失败，可以不用管它。

这样的方式在下次启动后，还需要再手动开启，可以加入服务中自动启动。

验证是否开启：
```bash
ps -e | grep ovs
```
![在这里插入图片描述]({{ site.imgurl }}Openv Switch的安装与运行/20200617173330404.png)
```bash
ovs-vsctl show
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020061717314525.png)

# 四、卸载OVS的内核模块
如果想要卸载，先停止服务：

```bash
ovs-ctl stop
```
查看OVS datapath：
```bash
ovs-dpctl show
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200618094633211.png)
删除datapath：
```bash
ovs-dpctl del-dp ovs-system
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200618094909936.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dpdHRvbg==,size_16,color_FFFFFF,t_70)
卸载openvswitch内核模块
```bash
rmmod openvswitch
```
此时查看内核模块，不再有openvswitch
```bash
lsmod | grep openvswitch
```

# 五、加入服务自动启动
## 1. CentOS6：
在/etc/init.d/目录创建一个ovs文件，内容如下：
```bash
#!/bin/bash
# chkconfig: 2345 30 80
# description:  Starts, stops ovs
#

# ovs Linux service controller script
cd "/usr/local/share/openvswitch/scripts/ovs-ctl"

case "$1" in
    start)
        ./ovs-ctl start
        ;;
    stop)
        ./ovs-ctl stop
        ;;
    *)
        echo "Usage: $0 {start|stop}"
        exit 1
        ;;
esac
```
并将之添加运行权限：
```
chmod 755 ./ovs
```
然后使用
```bash
chkconfig on
```
设置为开机启动。

## 2. CentOS7及以上版本：
在/usr/lib/systemd/system/下创建一个ovs.service文件，内容如下：
```bash
[Unit]
Description=Open vSwitch server daemon
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/share/openvswitch/scripts/ovs-ctl start
ExecStop=/usr/local/share/openvswitch/scripts/ovs-ctl stop

[Install]
WantedBy=multi-user.target
```
并将之添加运行权限：
```
chmod 777 ./ovs.service
```

然后使用：
```bash
systemctl enable ovs
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200622150652172.png)
设置为开机启动。

重启系统后可以看到进程：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200622151657263.png)

参考：
https://www.cnblogs.com/goldsunshine/p/10331606.html
https://www.cnblogs.com/yearsj/p/9648749.html
