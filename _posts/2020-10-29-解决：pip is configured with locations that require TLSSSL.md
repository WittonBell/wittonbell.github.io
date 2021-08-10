​---
layout: post
title:  "解决：pip is configured with locations that require TLS/SSL"
date:   2020-10-29 10:14:52 +0800
categories: [编程语言, python]
tags: [python, pip, TLS, SSL]
---
在使用pip进行软件包安装的时候出现问题：
```bash
WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201029101105212.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dpdHRvbg==,size_16,color_FFFFFF,t_70#pic_center)
解决：
```bash
make -p ~/.pip
vim ~/.pip/pip.conf
```
然后输入内容：
```bash
[global]
index-url = http://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host = mirrors.aliyun.com
```
再次使用pip安装即可。
