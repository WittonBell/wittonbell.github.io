# 一、下载gitlab以及gitlab-runner镜像
```bash
sudo podman pull docker.io/gitlab/gitlab-ee
sudo podman pull docker.io/gitlab/gitlab-runner
```

笔者下载的版本是gitlab-ee 14.5，gitlab-runner 14.5

# 二、运行容器与配置gitlab
## 1、运行gitlab容器
```bash
sudo podman run -dt \
  --h "192.168.1.8" \
  -p 443:443 -p 80:80 -p 22:22 -p 5050:5050 \
  --name gitlab \
  --restart always \
  -v /home/gitlab/etc:/etc/gitlab \
  -v /home/gitlab/logs:/var/log/gitlab \
  -v /home/gitlab/git-data:/var/opt/gitlab/git-data \
  -v /home/gitlab/backups:/var/opt/gitlab/backups \
  -v /home/gitlab/opt:/var/opt/gitlab \
  docker.io/gitlab/gitlab-ee
```
- -d：后台运行
- -t：分配伪终端
- -h：指定主机名
- -p：映射主机与容器端口，冒号前面为主机端口，后面为容器端口
- --name：指定名字
- -v：映射主机与容器的目录，冒号前面为主机目录，后面为容器目录
这里映射了gitlab的配置、日志、以及数据。要求在映射时主机存在相应的目录。

## 2、修改配置
笔者不作任何配置修改的情况下，运行gitlab会一直报错：
```bash
caller=cluster.go:154 component=cluster err="couldn't deduce an advertise address: no private IP found, explicit advertise addr not provided"

caller=main.go:241 msg="unable to initialize gossip mesh" err="create memberlist: Failed to get final advertise address: No private IP address found, and explicit IP not provided"
```
使用如下命令进入容器Bash：
```bash
sudo podman exec -it gitlab bash
```
然后修改/etc/gitlab/gitlab.rb文件（如果在创建容器时有将配置文件所在目录映射到主机，则可以直接在主机修改），添加如下配置：
```bash
alertmanager['flags'] = {
  'cluster.advertise-address' => "0.0.0.0:9093"
}
```
即可解决不断报错的问题。

添加如下配置，设置时区为上海时区
```bash
gitlab_rails['time_zone'] = 'Asia/Shanghai'
```

如果想开启Gitlab自带的容器镜像库，添加如下配置：
```bash
registry_external_url 'https://localhost:5050'
gitlab_rails['registry_enabled'] = true
registry_nginx['ssl_certificate_key'] = "/var/opt/gitlab/gitlab-rails/etc/gitlab-registry.key"
registry_nginx['ssl_certificate'] = "/var/opt/gitlab/registry/gitlab-registry.crt"
```
**需要注意的是证书及密钥的存储位置（笔者下载的Gitlab容器启用容器镜像库后，默认就是上面的位置），如果上面的目录中没有相应的文件，则需要修改为相应的位置**。


每次修改了gitlab.rb文件后，都需要**在主机使用如下命令**让配置生效：
```bash
sudo podman exec -it gitlab gitlab-ctl reconfigure
```
## 3、登录gitlab
在配置好gitlab并运行后，就可以使用root账号进行登录了，root账号的密码在：
```bash
/etc/gitlab/initial_root_password
```
文件中。
**注意：此文件将在第一次运行reconfigure后24小时删除，所以安装好后，需要尽快登录gitlab并设置密码。**

# 三、运行与注册gitlab-runner
## 1、运行gitlab-runner
```bash
sudo podman run -dt --name gitlab-runner --restart always -v /home/gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock docker.io/gitlab/gitlab-runner
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c638342105e64012a73e6d9d1fdf6df9.png)

由于gitlab-runner默认使用的用户为gitlab-runner，如上图所示，而/home/gitlab-runner默认是root用户才有相应的权限，为了顺利执行，笔者建议使用root用户执行，这样就不用手动修改/home/gitlab-runner的权限：

```bash
sudo podman run -dt --name gitlab-runner --restart always -v /home/gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock docker.io/gitlab/gitlab-runner run --working-directory=/home/gitlab-runner
```

**注意：为了让gitlab-runner能够使用docker命令，在创建容器时必须将/var/run/docker.sock映射到容器，否则会执行失败。**

## 2、进入容器Bash
使用下面的命令进入容器bash：
```bash
sudo podman exec -it gitlab-runner bash
```
## 3、注册gitlab-runner
### a、注册shell
```bash
root@7350bbb38bc1:/# gitlab-runner register
Runtime platform                                    arch=amd64 os=linux pid=84 revision=f0a95a76 version=14.5.0
Running in system-mode.                            
                                                   
Enter the GitLab instance URL (for example, https://gitlab.com/):
http://192.168.1.8/          ### 这里填写GitLab实例的URL地址
Enter the registration token:
WWgCAuScx5XGxEVS3Hza         ### 这里填写GitLab实例中的注册令牌，按下图所示的步骤获取令牌
Enter a description for the runner:
[293e39980f0f]: default      ### 这里填写描述信息 
Enter tags for the runner (comma-separated):
build						 ### 这里填写标签信息，需要注意的是这个标签在.gitlab-ci.yml中会用到
Registering runner... succeeded                     runner=CWgCAuSc
Enter an executor: docker, shell, virtualbox, docker+machine, docker-ssh+machine, kubernetes, custom, parallels, ssh, docker-ssh:
shell                      ### 这里选择执行器，根据自己情况进行选择
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded! 
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/9cfb057370324704a33c147db762df84.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

注册成功后，即可在gitlab中看到runner了
![在这里插入图片描述](https://img-blog.csdnimg.cn/c111b2a9dbab415489dd2fa305d717a5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)
### b、注册docker
如果想要在CI/CD时使用docker来进行打包发布，可以注册docker：
```bash
root@7350bbb38bc1:/# gitlab-runner register
Runtime platform                                    arch=amd64 os=linux pid=84 revision=f0a95a76 version=14.5.0
Running in system-mode.                            
                                                   
Enter the GitLab instance URL (for example, https://gitlab.com/):
http://192.168.1.8/          ### 这里填写GitLab实例的URL地址
Enter the registration token:
WWgCAuScx5XGxEVS3Hza         ### 这里填写GitLab实例中的注册令牌，按下图所示的步骤获取令牌
Enter a description for the runner:
[293e39980f0f]: master      ### 这里填写描述信息 
Enter tags for the runner (comma-separated):
docker						 ### 这里填写标签信息，需要注意的是这个标签在.gitlab-ci.yml中会用到
Registering runner... succeeded                     runner=CWgCAuSc
Enter an executor: docker, shell, virtualbox, docker+machine, docker-ssh+machine, kubernetes, custom, parallels, ssh, docker-ssh:
docker                      ### 这里选择执行器，输入docker
Enter the default Docker image (for example, ruby:2.6):
docker:latest               ## 输入docker使用的镜像
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded! 
```

docker镜像也可以使用构建在自己的镜像仓库中的镜像。

如果想要修改现有的gitlab-runner，可以在gitlab-runner容器中编辑/etc/gitlab-runner/config.toml

```bash
concurrent = 1
check_interval = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "master"
  url = "http://192.168.1.8/"
  token = "H7UaNzLUwSSx8sNVmrQH"
  executor = "shell"
  [runners.custom_build_dir]
  [runners.cache]
    [runners.cache.s3]
    [runners.cache.gcs]
    [runners.cache.azure]

[[runners]]
  name = "master"
  url = "http://192.168.1.8/"
  token = "hCNqcgJQ8jbNCnkrsP_R"
  executor = "docker"
  [runners.custom_build_dir]
  [runners.cache]
    [runners.cache.s3]
    [runners.cache.gcs]
    [runners.cache.azure]
  [runners.docker]
    tls_verify = false
    image = "docker"
    privileged = false
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache","/var/run/docker.sock:/var/run/docker.sock"]
    shm_size = 0
    pull_policy = "if-not-present"
```

gitlab-runner注册docker时需要填写一个镜像名称，在.gitlab-ci.yml配置文件中有一个image关键字也可以指定镜像名，这两个有什么关系呢？

这两个镜像都是用于运行.gitlab-ci.yml配置文件中的脚本命令，如果.gitlab-ci.yml中没有指定image，则默认使用gitlab-runner注册docker时使用的镜像，否则使用.gitlab-ci.yml中指定image镜像。

在使用docker时，为了避免每次都从网络上拉取，可以设置
```bash
pull_policy = "if-not-present"
```
这样配置后，如果本地有镜像则直接使用本地镜像。

## 4、安装相应的软件
由于gitlab-runner是使用的ubuntu系统制作而成，在安装软件前，需要执行一次更新：

```bash
apt update
```
否则在安装软件时可能报错：

```bash
E: Unable to locate package
```

更新后，就可以按自己需要安装相应的软件了，比如笔者需要C++相应的编译环境，安装：

```bash
apt install cmake
apt install g++
```

在安装cmake时会额外安装一些包，比如gcc等等，但是不会安装g++包，所以需要单独安装g++：

```bash
root@7350bbb38bc1:~# apt install cmake
Reading package lists... Done
Building dependency tree       
Reading state information... Done
The following additional packages will be installed:
  binutils binutils-common binutils-x86-64-linux-gnu cmake-data cpp cpp-9 gcc gcc-9 gcc-9-base libarchive13 libasan5 libatomic1 libbinutils libc-dev-bin libc6-dev libcc1-0 libcrypt-dev libctf-nobfd0 libctf0 libgcc-9-dev libgomp1
  libicu66 libisl22 libitm1 libjsoncpp1 liblsan0 libmpc3 libmpfr6 libquadmath0 librhash0 libtsan0 libubsan1 libuv1 libxml2 linux-libc-dev make manpages manpages-dev
Suggested packages:
  binutils-doc cmake-doc ninja-build cpp-doc gcc-9-locales gcc-multilib autoconf automake libtool flex bison gdb gcc-doc gcc-9-multilib gcc-9-doc lrzip glibc-doc make-doc man-browser
The following NEW packages will be installed:
  binutils binutils-common binutils-x86-64-linux-gnu cmake cmake-data cpp cpp-9 gcc gcc-9 gcc-9-base libarchive13 libasan5 libatomic1 libbinutils libc-dev-bin libc6-dev libcc1-0 libcrypt-dev libctf-nobfd0 libctf0 libgcc-9-dev
  libgomp1 libicu66 libisl22 libitm1 libjsoncpp1 liblsan0 libmpc3 libmpfr6 libquadmath0 librhash0 libtsan0 libubsan1 libuv1 libxml2 linux-libc-dev make manpages manpages-dev
0 upgraded, 39 newly installed, 0 to remove and 1 not upgraded.
Need to get 48.4 MB of archives.
```

# 四、测试
## 1、测试Shell
### A、准备项目
新建一个demo项目，这个项目中有如下三个文件：

![在这里插入图片描述](https://img-blog.csdnimg.cn/c17df80e3d784b3ca5141653f17e613c.png)

编写一个.gitlab-ci.yml文件，内容如下：
```yaml
stages:
    - build

build:
    stage: build
    script:
    - rm build -rf
    - mkdir -p build
    - cd build
    - cmake .. -DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++
    - time make -j4
    tags:
    - build
    only:
        changes:
           - "**/*.{c,cpp,cc,h,hpp,cxx,C}"
           - "**/CMakeLists.txt"
           - "CMakeLists.txt"
           - "*.{c,cpp,cc,h,hpp,cxx,C}"
```

其中的tags就是前面注册gitlab-runner使用的标签

CMakeLists.txt文件内容如下：
```c
cmake_minimum_required(VERSION 3.0.0)
project(demo VERSION 0.1.0)

include(CTest)
enable_testing()

add_executable(demo main.cpp)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
```
main.cpp文件内容如下：
```cpp
#include <stdio.h>
#include <iostream>

using namespace std;

int main(int, char**) {
	cout << "Hello, world!\n";
	printf("测试\n");
	return 0;
}
```

上传到gitlab后，会自动触发编译项目，如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/06259ded44e44c4db83e1ab0f3204231.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

### B、测试容器镜像库
在前面配置gitlab时有提到，可以启用Gitlab自带容器镜像库，当然也可以配置成外部的容器镜像库，不过配置要复杂些。前面的配置是使用的自带的容器镜像库，启用成功后可以在项目中看到如下图所示功能：

![在这里插入图片描述](https://img-blog.csdnimg.cn/f8b506e5ede240d8ab3b0c050f5c9827.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_17,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/41a83c8940d7453cb6e24d763ca4a9bc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

从图中提示可以看出，要使用容器镜像库，还需要先登录，再构建容器镜像，最后推送到容器镜像库，才能显示到页面上。
**需要注意的是，这里配置的容器镜像库由于是使用的localhost，所以只能供主机或者容器使用**

根据页面提示的命令，来进行测试：
#### a、准备环境
在主机上新建一个目录，比如mon，创建一个Dockfile文件，内容如下：
```bash
from ubuntu
Run echo "这是一个podman测试"
```

#### b、登录
使用下面的命令登录：
```bash
sudo docker login localhost:5050
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/4649df5a286448f19d7f60896941d2c6.png)
登录时需要输入用户名与密码，要求与Gitlab中的用户名密码一致。

#### c、构建容器镜像
![在这里插入图片描述](https://img-blog.csdnimg.cn/ea53a3844f33477aabc5a3b5f6fd4b23.png)
#### d、推送
![docker push localhost:5050/gitlab-instance-fbb7733d/monitoring](https://img-blog.csdnimg.cn/7ace33a9100147079de1745e2674ee75.png)
#### e、刷新gitlab容器镜像库页面
推送成功后刷新页面即可看到镜像库列表了，如下图所示：
![在这里插入图片描述](https://img-blog.csdnimg.cn/25645acfde5841c1ab498a665aa6f9a0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)
## 2、测试docker
### A、准备环境
这里以一个go语言项目为例，所以需要在gitlab-runner中准备go的编译环境。
如果不使用shell的方式，而是使用docker的方式，在.gitlab-ci.yml中使用image关键指定镜像为golang，就可以跳过此步。

如果使用shell的方式，由于gitlab-runner容器中使用apt或者yum安装的Go版本可能比较老，所以建议自行下载新版的Go，笔者下载的go1.16.11.linux-amd64.tar.gz，然后使用命令复制到gitlab-runner容器中

```bash
sudo podman cp go1.16.11.linux-amd64.tar.gz gitlab-runner:/usr/local
```

在容器中解压go1.16.11.linux-amd64.tar.gz到/usr/local

```bash
cd /usr/local
tar zxvf go1.16.11.linux-amd64.tar.gz
```

go编译环境还需要安装gcc，前面有说明，这里就不再赘述了。


### B、准备项目
新建一个GoDemo目录，目录中有main.go、Dockerfile和.gitlab-ci.yml三个文件，
main.go内容如下：

```go
package main

import (
	"net/http"
)

func main() {
	http.HandleFunc("/", func(writer http.ResponseWriter, request *http.Request) {
		writer.Write([]byte("Hello, 这是一个CI/CD测试!"))
	})

	http.ListenAndServe(":8000", nil)
}
```

Dockerfile内容如下：

```bash
FROM ubuntu

# 镜像中项目路径
WORKDIR $GOPATH/src/GoDemo
# 拷贝当前目录代码到镜像
COPY . $GOPATH/src/GoDemo

# 暴露端口
EXPOSE 8000

# 程序入口
ENTRYPOINT ["./bin/demo"]
```

.gitlab-ci.yml内容如下：

```yaml
default:
  before_script:
    - export PATH=$PATH:/usr/local/go/bin   # 添加go命令的路径
    - export GOPATH=~/go                    # 设置GOPATH环境变量
    - mkdir -p $GOPATH/src/                 # 根据go要求，创建src目录
    - ln -svf $CI_PROJECT_DIR $GOPATH/src/  # 由于gitlab-runner的工作目录不在Go要求的目录，所以这里做一个软链接
    - cd $CI_PROJECT_DIR                    # 切换到源码目录
    - go mod init demo						# 生成go.mod文件
    - go mod tidy 							# 生成go.sum文件
    - go get								# 下载依赖项
  
variables:
  #CI_DEBUG_TRACE: "true"					# 用于CI调试，输出相关的变量值
  GO111MODULE: "on"							# 打开go的模块标志
  GOPROXY: "https://goproxy.cn,direct"      # 由于默认的代理很慢，国内建议使用https://goproxy.cn作代理

stages:
	- gen
    - test
    - build
    - deploy

format:
    stage: test
    tags:
      - build
    script:
      - go fmt $(go list ./... | grep -v /vendor/)
      - go vet $(go list ./... | grep -v /vendor/)

test:
    stage: test
    tags:
      - build
    script:
      - go test -race $(go list ./... | grep -v /vendor/)

compile:
    stage: build
    tags:
      - build
    script:
      - go build -race -ldflags "-extldflags '-static'" -o $CI_PROJECT_DIR/bin/demo
    artifacts:
      paths:
        - $CI_PROJECT_DIR/bin/

docker-deploy:
  image:
    name: docker:latest
  stage: deploy
  before_script:
    # 需要先登录gitlab内置的镜像仓库
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    # 使用Dockerfile生成容器镜像
    - docker build --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA --tag $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA  	# 按SHA推送镜像
    - docker push $CI_REGISTRY_IMAGE:latest				# 推送latest镜像
    - docker rmi -f $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA   # 删除本地临时镜像
    - docker rmi -f $CI_REGISTRY_IMAGE:latest			# 删除本地临时镜像
  tags:
    - docker

# 让gitlab具有代码跳转的能力
code_navigation:
  stage: gen
  image: sourcegraph/lsif-go:v1
  allow_failure: true # recommended
  script:
    - lsif-go -o server.lsif
  artifacts:
    reports:
      lsif: server.lsif
  tags:
      - docker
```

如果是使用golang的docker镜像，则可以不用设置PATH变量，比如compile，可以写为：

```bash
compile:
    image: golang:1.16
    stage: build
    tags:
      - docker
    script:
      - go version
      - go mod init demo
      - go mod tidy
      - go get
      - go mod vendor
      - go build -race -ldflags "-extldflags '-static'" -o $CI_PROJECT_DIR/bin/demo
    artifacts:
      paths:
        - $CI_PROJECT_DIR/bin/
```

### C、测试
笔者的运行流水线如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/c9cf673d9fc14c3d9d09356ce95c52ed.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

容器镜像库如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/683e17af02744d48828d3a8b346b49b9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

前面.gitlab-ci.yml中code_navigation让gitlab页面可以进行代码跳转，效果如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/bb4027fb949846b19e5821fdb818bbdc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

运行前面提交的镜像，注意需要把端口映射出来：

![在这里插入图片描述](https://img-blog.csdnimg.cn/0587faa34df74c3d8cfd2414b1c78b79.png)

查看运行情况：

![在这里插入图片描述](https://img-blog.csdnimg.cn/002d5ee67640472a8e0eb4c7b508906e.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/71a41faf143a47b4ac0a29edeefde04f.png)

运行成功。