---
layout: post
title:  "使用CheckInstall从源码制作RPM安装包"
date:   2020-10-29 16:20:32 +0800
categories: Linux
tags: [Linux, CheckInstall, RPM, 安装包]
---

* content
{:toc}

# 一、下载并安装CheckInstall
1. RPM安装包
目前最新的包为1.62版，CentOS 6.X的RPM安装包可以下载[checkinstall-1.6.2-1.cnt6.x86_64.rpm](ftp://ftp.pbone.net/mirror/rnd.rajven.net/centos/6.5/os/x86_64/checkinstall-1.6.2-1.cnt6.x86_64.rpm)
然后：

```bash
sudo rpm -ivh checkinstall-1.6.2-1.cnt6.x86_64.rpm
sudo ln -s /usr/lib64/checkinstall/installwatch.so /usr/lib64/installwatch.so
sudo ln -s /usr/lib64/checkinstall/checkinstallrc /etc/checkinstallrc
```

2. 源码包
从官网下载源码[checkinstall-1.6.2.tar.gz](https://asic-linux.com.mx/~izto/checkinstall/files/source/checkinstall-1.6.2.tar.gz)
解压：
```bash
tar xvf checkinstall-1.6.2.tar.gz
```
编译会报错:
```bash
installwatch.c:2942:5: 错误：与‘readlink’类型冲突
 int readlink(const char *path,char *buf,size_t bufsiz) {
     ^
In file included from installwatch.c:41:0:
/usr/include/unistd.h:828:16: 附注：‘readlink’的上一个声明在此
 extern ssize_t readlink (__const char *__restrict __path,
                ^
installwatch.c:3080:5: 错误：与‘scandir’类型冲突
 int scandir( const char *dir,struct dirent ***namelist,
     ^
In file included from installwatch.c:49:0:
/usr/include/dirent.h:252:12: 附注：‘scandir’的上一个声明在此
 extern int scandir (__const char *__restrict __dir,
            ^
installwatch.c:3692:5: 错误：与‘scandir64’类型冲突
 int scandir64( const char *dir,struct dirent64 ***namelist,
     ^
In file included from installwatch.c:49:0:
/usr/include/dirent.h:275:12: 附注：‘scandir64’的上一个声明在此
 extern int scandir64 (__const char *__restrict __dir,

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201029154445109.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dpdHRvbg==,size_16,color_FFFFFF,t_70#pic_center)
修改源文件installwatch.c：
101行：
```cpp
static int (*true_scandir)(	const char *,struct dirent ***,
				int (*)(const struct dirent *),
				int (*)(const void *,const void *));
```
改为：
```cpp
static int (*true_scandir)(	const char *,struct dirent ***,
				int (*)(const struct dirent *),
				int (*)(const struct dirent **,const struct dirent **));
```

121行：
```cpp
static int (*true_scandir64)(	const char *,struct dirent64 ***,
				int (*)(const struct dirent64 *),
				int (*)(const void *,const void *));
```
改为：
```cpp
static int (*true_scandir64)(	const char *,struct dirent64 ***,
				int (*)(const struct dirent64 *),
				int (*)(const struct dirent64 **,const struct dirent64 **));
```

2529行：
```cpp
FILE *fopen(const char *pathname, const char *mode) {
	FILE *result;
```
改为：
```cpp
FILE *fopen(const char *pathname, const char *mode) {
	FILE *result=0;
```
	
2941行：
```cpp
#if (GLIBC_MINOR <= 4)
int readlink(const char *path,char *buf,size_t bufsiz) {
	int result;
#else
ssize_t readlink(const char *path,char *buf,size_t bufsiz) {
	ssize_t result;
#endif
```
改为：
```cpp
#if 0
int readlink(const char *path,char *buf,size_t bufsiz) {
	int result;
#else
ssize_t readlink(const char *path,char *buf,size_t bufsiz) {
	ssize_t result;
#endif
```

3080行：
```cpp
int scandir(	const char *dir,struct dirent ***namelist,
		int (*select)(const struct dirent *),
		int (*compar)(const void *,const void *)	) {
```
改为：

```cpp
int scandir(	const char *dir,struct dirent ***namelist,
		int (*select)(const struct dirent *),
		int (*compar)(const struct dirent **,const struct dirent **)	) {
```

3692行：
```cpp
int scandir64(	const char *dir,struct dirent64 ***namelist,
		int (*select)(const struct dirent64 *),
		int (*compar)(const void *,const void *)	) {
```
改为：
```cpp
int scandir64(	const char *dir,struct dirent64 ***namelist,
		int (*select)(const struct dirent64 *),
		int (*compar)(const struct dirent64 **,const struct dirent64 **)	) {
```
来一个直观的修改对比：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201029164346480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dpdHRvbg==,size_16,color_FFFFFF,t_70#pic_center)

修改完成后再重新编译。

# 二、使用CheckInstall
这里使用的CheckInstall的RPM安装包进行安装的。
在使用checkinstall之前需要做一点小修改，以免在执行的过程中报错：
```bash
error: File not found: /root/rpmbuild/BUILDROOT/
```
编辑/usr/bin/checkinstall
```bash
sudo vim /usr/bin/checkinstall
```
搜索关键词-bb，笔者的是在2451行，将：
```bash
$RPMBUILD -bb ${RPM_TARGET_FLAG}${ARCHITECTURE} "$SPEC_PATH" &> ${TMP_DIR}/rpmbuild.log
```
改为：
```bash
$RPMBUILD -bb ${RPM_TARGET_FLAG}${ARCHITECTURE} --buildroot=$BUILD_DIR "$SPEC_PATH" &> ${TMP_DIR}/rpmbuild.log
```

下面以制作GCC 9.2的安装包为例，在make完成后，使用checkinstall：

```bash
sudo checkinstall
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201029152735359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dpdHRvbg==,size_16,color_FFFFFF,t_70#pic_center)
中途可能会出现：
```bash
======================== Installation successful ==========================

Copying files to the temporary directory...OK

Stripping ELF binaries...OK

Compressing man pages...OK

Building file list...OK

/root/rpmbuild has no SOURCES directory. Please write the path to
the RPM source directory tree: 

```
可以安装rpmdevtools：

```bash
sudo yum install rpm-build -y
sudo yum install rpmdevtools -y
sudo rpmdev-setuptree
```
可以看到/root/rpmbuild目录了
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201029114228890.png#pic_center)
再重新执行前面的checkinstall命令，可以看到成功生成RPM安装包，路径在/root/rpmbuild/RPMS/x86_64目录中，并且已经执行了一次RPM安装包的安装，通过
```bash
rpm -qa | grep gcc
```
可以看到，如图所示。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201029153807208.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dpdHRvbg==,size_16,color_FFFFFF,t_70#pic_center)

从上图中可以看到
```bash
Install RPM package... OK
```
以及
```bash
Writing backup package... OK
```
即会自动安装RPM包以及备份，同时生成的安装包默认是在/root/rpmbuild/RPMS/目录，我们可以在执行sudo checkinstall的时候添加参数改变这些行为，改为：

```bash
sudo checkinstall --install=no --backup=no --pakdir=.
```
这样就会在将生成的RPM包放在当前目录，并且不会在制作RPM完成后自动安装和备份。
每次都这样写岂不是很麻烦，修改/usr/lib64/checkinstall/checkinstallrc中的内容即可：
```bash
PAK_DIR="."
BACKUP=0
INSTALL=0 
```

*本文所用系统为Centos 6.10*