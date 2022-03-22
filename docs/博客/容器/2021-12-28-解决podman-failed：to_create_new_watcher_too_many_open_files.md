今天在服务中部署容器时，出现错误：
```bash
Error: error configuring CNI network plugin: failed to create new watcher too many open files
```
通过：
```bash
cat /proc/sys/fs/inotify/max_user_instances
cat /proc/sys/fs/inotify/max_user_watches 
```
查看结果为：

```bash
fs.inotify.max_user_instances = 128
fs.inotify.max_user_watches = 264039
```
max_user_instances比较小，而max_user_watches还是有那么大，但是还是不够用。最近服务器中就部署了gitlab，gitlab-runner，centos，mysql和Nexus3几个容器，不应该这么快就用完了，使用命令：
```bash
 sudo lsof | awk '{print $2}' | sort | uniq -c | sort -n
```
查看进程打开的文件数，但是会输出很多类似下面的消息：
```bash
lsof: no pwd entry for UID 996
```
需要使用-w参数忽略掉：
```bash
 sudo lsof -w | awk '{print $2}' | sort | uniq -c | sort -n
```
等一段时间（根据机器性能，等待时间不一）然后输出如下：

```bash
      1 PID
      2 10
      2 100
      2 101
      2 102
      2 103
      2 104
      2 106
      2 107
      2 108
      2 109
中间忽略
   1075 273643
   1116 586147
   1248 409942
   1292 585892
   1456 584807
   1504 585826
   1596 585997
   2625 121006
   2625 121812
   2625 130318
   2800 126655
   2990 273788
   3471 273807
   3680 273808
   3843 120203
   3843 123530
   3843 124993
   3843 131045
   3843 132859
   3864 122790
   3864 124261
   3864 127513
   3864 128362
   3864 131863
   4026 129092
   4048 125801
   5496 714909
   8896 585006
  10320 233111
  17316 273704
 409401 2882334
```
最后发现一个进程（ID为2882334）占用了409401个文件描述符，查看这个进程：

```bash
witton@witton ~$: ps -elf | grep 2882334
0 S witton       734885  733972  0  80   0 -  2408 pipe_r 14:45 pts/3    00:00:00 grep --color=auto 2882334
4 S 200      2882334 2882322  0  80   0 - 3303959 -    Dec23 ?        00:56:16 /usr/lib/jvm/java-1.8.0-openjdk-1.8.0.282.b08-2.el8_3.x86_64/jre/bin/java -server -Dinstall4j.jvmDir=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.282.b08-2.el8_3.x86_64/jre -Dexe4j.moduleName=/opt/sonatype/nexus/bin/nexus -XX:+UnlockDiagnosticVMOptions -Dinstall4j.launcherId=245 -Dinstall4j.swt=false -Di4jv=0 -Di4jv=0 -Di4jv=0 -Di4jv=0 -Di4jv=0 -Xms2703m -Xmx2703m -XX:MaxDirectMemorySize=2703m -Djava.util.prefs.userRoot=/nexus-data/javaprefs -XX:+UnlockDiagnosticVMOptions -XX:+LogVMOutput -XX:LogFile=../sonatype-work/nexus3/log/jvm.log -XX:-OmitStackTraceInFastThrow -Djava.net.preferIPv4Stack=true -Dkaraf.home=. -Dkaraf.base=. -Dkaraf.etc=etc/karaf -Djava.util.logging.config.file=etc/karaf/java.util.logging.properties -Dkaraf.data=../sonatype-work/nexus3 -Dkaraf.log=../sonatype-work/nexus3/log -Djava.io.tmpdir=../sonatype-work/nexus3/tmp -Dkaraf.startLocalConsole=false -Djdk.tls.ephemeralDHKeySize=2048 -Djava.endorsed.dirs=lib/endorsed -Di4j.vpt=true -classpath /opt/sonatype/nexus/.install4j/i4jruntime.jar:/opt/sonatype/nexus/lib/boot/nexus-main.jar:/opt/sonatype/nexus/lib/boot/activation-1.1.1.jar:/opt/sonatype/nexus/lib/boot/jakarta.xml.bind-api-2.3.3.jar:/opt/sonatype/nexus/lib/boot/jaxb-runtime-2.3.3.jar:/opt/sonatype/nexus/lib/boot/txw2-2.3.3.jar:/opt/sonatype/nexus/lib/boot/istack-commons-runtime-3.0.10.jar:/opt/sonatype/nexus/lib/boot/org.apache.karaf.main-4.3.2.jar:/opt/sonatype/nexus/lib/boot/osgi.core-7.0.0.jar:/opt/sonatype/nexus/lib/boot/org.apache.karaf.specs.activator-4.3.2.jar:/opt/sonatype/nexus/lib/boot/org.apache.karaf.diagnostic.boot-4.3.2.jar:/opt/sonatype/nexus/lib/boot/org.apache.karaf.jaas.boot-4.3.2.jar com.install4j.runtime.launcher.UnixLauncher run 9d17dc87 0 0 org.sonatype.nexus.karaf.NexusMain
```
从结果可以看出是nexus3，它目前只是作为docker的私有仓库而已，而且仓库中的镜像也就几个，也不知道是不是nexus3有Bug，导致资源泄漏。

先不管它，观察一段时间再说，先把inotify的参数设置大一些，让其它容器能够启动。
临时设置：
```bash
sudo sysctl fs.inotify.max_user_instances=8192
```
永久设置需要修改/etc/sysctl.conf文件，在其最后添加：

```bash
fs.inotify.max_user_instances=8192
```

或者直接使用下面的命令：
```bash
sudo echo fs.inotify.max_user_instances=8192| sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
另外还需要设置系统的ulimit，在/etc/security/limits.conf中添加两行：

```bash
* hard nofile 2048000
* soft nofile 2048000
```

参考链接：

https://github.com/cri-o/ocicni/pull/93

https://www.cnblogs.com/wiseo/p/14655689.html