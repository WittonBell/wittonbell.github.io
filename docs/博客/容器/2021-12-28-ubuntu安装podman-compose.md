用过docker-compose的一定不会对podman-compose陌生，podman作为docker的替代品，自然podman-compose也是docker-compose的替代品。一些系统默认情况下，是只安装了docker-compose，而没有安装podman-compose。

这里就记录一下如何在ubuntu21.10中安装podman-compose。

# 一、安装pip
由于podman-compose是使用python编写，所以需要有python3的环境。ubuntu21.10系统默认会安装python3但是不一定会安装pip3，所以需要先安装pip3，如果直接使用

```bash
sudo apt install pip
```
进行安装，会有很多额外的软件包需要安装，占用约600M的磁盘空间。
![在这里插入图片描述](https://img-blog.csdnimg.cn/63e683ed3d4a47f3ae87f4c89bddc4e7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)
所以如果用不上那些额外的软件包，笔者建议使用另一种方式安装pip，下载一个[get-pip.py](https://bootstrap.pypa.io/get-pip.py)文件

```bash
https://bootstrap.pypa.io/get-pip.py
```
然后执行：

```python
python3 get-pip.py
```
来安装。

# 二、安装podman-compose
建议国内的朋友使用下面的方式安装：
```python
pip3 install https://github.com/containers/podman-compose/archive/devel.tar.gz
```
在[podman-compose](https://github.com/containers/podman-compose)的github源码说明中，有几种方式进行安装：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2601c03e7ef34811ba23f02a7c47bc0c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

由于国内经常是无法访问https://raw.githubusercontent.com，所以不建议从此URL下载进行安装。