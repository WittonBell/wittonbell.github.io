CMake的出现极大的方便了C/C++项目的编译管理，避免了手工写Makefile的繁琐。如果在C/C++项目中有需要使用到外联汇编语言，CMake也一样可以进行编译管理。

在Linux下常用的C/C++编译器为GCC。近些年，随着LLVM项目的发展，Clang也占有了一席之地。但它们在Linux平台下，背后默认的汇编器依然是GAS。GAS使用语法格式为AT&T，与我们平常学习的Intel格式截然不同。它们的差别这里就不赘述了，网络上很多这方面的资料。那我们能不能在Linux平台也使用我们熟悉的Intel语法格式的汇编呢？答案是肯定的。

这里就介绍一下使用CMake来构建C/C++程序，并且可以与NASM汇编程序进行互调。

笔者使用的环境是Windows下的VSCode远程连接到64位的Linux，在VSCode中新建一个CMake项目。创建好项目后，一般有两个文件：main.cpp、CMakeLists.txt，我们再创建一个test.asm，**需要注意所有文件的编码格式一定要是`utf-8`或者`utf-8 with BOM`**

把main.cpp内容改为：
```cpp
#include <stdio.h>

extern "C" void 汇编函数(); // 声明汇编语言中定义的函数

int 输出() {
    printf("C/C++输出\n");
    return 0;
}

int main(int, char**) {
    输出();
    汇编函数();
    return 0;
}
```

CMakeLists.txt的内容：
```cmake
cmake_minimum_required(VERSION 3.0.0)
project(demo VERSION 0.1.0)

#下面两句非常重要，如果需要生成调试，第三句也是必须的
SET(CMAKE_ASM_NASM_SOURCE_FILE_EXTENSIONS asm)  # 设置NASM的文件扩展名为asm
ENABLE_LANGUAGE(ASM_NASM)  # 让CMacke启用NASM的汇编
SET(CMAKE_ASM_NASM_FLAGS "-g") # 让NASM生成调试信息

add_executable(demo main.cpp test.asm)
```

test.asm的内容：

```asm
extern printf ;声明printf，将调用C语言的printf函数

section .rodata
    msg  db "这是汇编中的输出",0xa,0

section .text
global 汇编函数
汇编函数:
    push 	rbp
    mov 	rbp, rsp
    lea 	rdi, [rel msg]
    call printf wrt ..plt ;也可以使用 call 	[rel printf wrt ..got]
    mov 	eax, 0
    leave
    ret
```
我们先来看看运行情况：
![在这里插入图片描述](https://img-blog.csdnimg.cn/6567f51a2ff344f097e3265b6ca02eca.png)


在NASM汇编代码中需要特别注意的地方是下面两句：
```asm
lea  rdi, [rel msg]
call printf wrt ..plt 
```

因为GCC编译器默认会使用PIE(Position-Independent-Executable)模式（即位置无关的模式，这里就不深入探讨了，感兴趣的朋友可以网上查资料深入了解），所以64位的汇编也必须要使用PIE模式。如果我们直接按下面的方式来写：
```asm
lea  rdi, [msg]
```
就会出现链接错误：
```shell
[build] /usr/bin/ld: CMakeFiles/demo.dir/test.asm.o: relocation R_X86_64_32S against `.rodata' can not be used when making a PIE object; recompile with -fPIE
[build] /usr/bin/ld: failed to set dynamic section sizes: bad value
[build] collect2: error: ld returned 1 exit status
```
或者调用的方式写成：
```asm
call printf
```
也会出现链接错误：
```shell
[build] /usr/bin/ld: CMakeFiles/demo.dir/test.asm.o: warning: relocation against `printf@@GLIBC_2.2.5' in read-only section `.text'
[build] /usr/bin/ld: CMakeFiles/demo.dir/test.asm.o: relocation R_X86_64_PC32 against symbol `printf@@GLIBC_2.2.5' can not be used when making a PIE object; recompile with -fPIE
[build] /usr/bin/ld: final link failed: bad value
[build] collect2: error: ld returned 1 exit status
```

当然，也可以让GCC不使用PIE模式，在CMakeLists.txt中添加一句：
```shell
SET(CMAKE_CXX_FLAGS "-no-pie")
```
这样就可以把前面两句写成：
```asm 
lea  rdi, [msg]
call printf
```

但是不建议这样做，具体原因可以网上查询相关资料。

参考资料：
[https://stackoverflow.com/questions/65912204/how-to-compile-nasm-program-calling-printf](https://stackoverflow.com/questions/65912204/how-to-compile-nasm-program-calling-printf)
[https://stackoverflow.com/questions/52126328/cant-call-c-standard-library-function-on-64-bit-linux-from-assembly-yasm-code](https://stackoverflow.com/questions/52126328/cant-call-c-standard-library-function-on-64-bit-linux-from-assembly-yasm-code)
[https://stackoverflow.com/questions/8194141/how-to-print-a-number-in-assembly-nasm](https://stackoverflow.com/questions/8194141/how-to-print-a-number-in-assembly-nasm)