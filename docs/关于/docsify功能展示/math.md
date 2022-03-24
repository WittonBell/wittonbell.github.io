
# 行内数学公式

使用 `$`标识行内数学公式：$x^2+\sqrt[3]{10}$

```md
$x^2+\sqrt[3]{10}$
```

# 块数学公式

下面是 `$$`标识的块数学公式：

$$
\iiint_x^y dx
$$

```md
$$
\iiint_x^y dx
$$
```

$$
\frac{1}{
  \Bigl(\sqrt{\phi \sqrt{5}}-\phi\Bigr) e^{
  \frac25 \pi}} = 1+\frac{e^{-2\pi}} {1+\frac{e^{-4\pi}} {
    1+\frac{e^{-6\pi}}
    {1+\frac{e^{-8\pi}}{1+\cdots}}
  }
}
$$

```md
$$
\frac{1}{
  \Bigl(\sqrt{\phi \sqrt{5}}-\phi\Bigr) e^{
  \frac25 \pi}} = 1+\frac{e^{-2\pi}} {1+\frac{e^{-4\pi}} {
    1+\frac{e^{-6\pi}}
    {1+\frac{e^{-8\pi}}{1+\cdots}}
  }
}
$$
```

# 解方程

$$
\begin{array}{l} 
  \text{对于方程形如：}x^{3}-1=0 \\ 
  \text{设}\text{:}\omega =\frac{-1+\sqrt{3}i}{2} \\ 
  x_{1}=1,x_{2}= \omega =\frac{-1+\sqrt{3}i}{2} \\ 
  x_{3}= \omega ^{2}=\frac{-1-\sqrt{3}i}{2} 
\end{array} 
$$

```md
$$
\begin{array}{l} 
  \text{对于方程形如：}x^{3}-1=0 \\ 
  \text{设}\text{:}\omega =\frac{-1+\sqrt{3}i}{2} \\ 
  x_{1}=1,x_{2}= \omega =\frac{-1+\sqrt{3}i}{2} \\ 
  x_{3}= \omega ^{2}=\frac{-1-\sqrt{3}i}{2} 
\end{array} 
$$
```

# 不等式

$$
\begin{array}{l} 
  a\mathop{{x}}\nolimits^{{2}}+bx+c=0 \\ 
  \Delta =\mathop{{b}}\nolimits^{{2}}-4ac \\ 
  \left\{\begin{matrix} 
  \Delta \gt 0\text{方程有两个不相等的实根} \\ 
  \Delta = 0\text{方程有两个不相等的实根} \\ 
  \Delta \lt 0\text{方程有两个不相等的实根} 
\end{matrix}\right.    
\end{array} 
$$

```md
$$
\begin{array}{l} 
  a\mathop{{x}}\nolimits^{{2}}+bx+c=0 \\ 
  \Delta =\mathop{{b}}\nolimits^{{2}}-4ac \\ 
  \left\{\begin{matrix} 
  \Delta \gt 0\text{方程有两个不相等的实根} \\ 
  \Delta = 0\text{方程有两个不相等的实根} \\ 
  \Delta \lt 0\text{方程有两个不相等的实根} 
\end{matrix}\right.    
\end{array} 
$$
```

# 集合

$$
\left.\begin{matrix} 
  m \subset \alpha ,n \subset \alpha ,m \cap n=P \\  
  a \perp m,a \perp n 
\end{matrix}\right\}\Rightarrow a \perp \alpha 
$$

```md
$$
\left.\begin{matrix} 
  m \subset \alpha ,n \subset \alpha ,m \cap n=P \\  
  a \perp m,a \perp n 
\end{matrix}\right\}\Rightarrow a \perp \alpha 
$$
```
# 分式

$$
\begin{array}{c} 
  H_{n}=\frac{n}{\sum \limits_{i=1}^{n}\frac{1}{x_{i}}}= \frac{n}{\frac{1}{x_{1}}+ \frac{1}{x_{2}}+ \cdots + \frac{1}{x_{n}}} \\ G_{n}=\sqrt[n]{\prod \limits_{i=1}^{n}x_{i}}= \sqrt[n]{x_{1}x_{2}\cdots x_{n}} \\ A_{n}=\frac{1}{n}\sum \limits_{i=1}^{n}x_{i}=\frac{x_{1}+ x_{2}+ \cdots + x_{n}}{n} \\ Q_{n}=\sqrt{\sum \limits_{i=1}^{n}x_{i}^{2}}= \sqrt{\frac{x_{1}^{2}+ x_{2}^{2}+ \cdots + x_{n}^{2}}{n}} \\ H_{n}\leq G_{n}\leq A_{n}\leq Q_{n} 
\end{array}
$$

```md
$$
\begin{array}{c} 
  H_{n}=\frac{n}{\sum \limits_{i=1}^{n}\frac{1}{x_{i}}}= \frac{n}{\frac{1}{x_{1}}+ \frac{1}{x_{2}}+ \cdots + \frac{1}{x_{n}}} \\ G_{n}=\sqrt[n]{\prod \limits_{i=1}^{n}x_{i}}= \sqrt[n]{x_{1}x_{2}\cdots x_{n}} \\ A_{n}=\frac{1}{n}\sum \limits_{i=1}^{n}x_{i}=\frac{x_{1}+ x_{2}+ \cdots + x_{n}}{n} \\ Q_{n}=\sqrt{\sum \limits_{i=1}^{n}x_{i}^{2}}= \sqrt{\frac{x_{1}^{2}+ x_{2}^{2}+ \cdots + x_{n}^{2}}{n}} \\ H_{n}\leq G_{n}\leq A_{n}\leq Q_{n} 
\end{array}
$$
```

# 矩阵

$$
\begin{array}{c} 
  A={\left[ a_{ij}\right]_{m \times n}},B={\left[ b_{ij}\right]_{n \times s}} \\  
  c_{ij}= \sum \limits_{k=1}^{{n}}a_{ik}b_{kj} \\  
  C=AB=\left[ c_{ij}\right]_{m \times s}  
  = \left[ \sum \limits_{k=1}^{n}a_{ik}b_{kj}\right]_{m \times s} 
\end{array}
$$

```md
$$
\begin{array}{c} 
  A={\left[ a_{ij}\right]_{m \times n}},B={\left[ b_{ij}\right]_{n \times s}} \\  
  c_{ij}= \sum \limits_{k=1}^{{n}}a_{ik}b_{kj} \\  
  C=AB=\left[ c_{ij}\right]_{m \times s}  
  = \left[ \sum \limits_{k=1}^{n}a_{ik}b_{kj}\right]_{m \times s} 
\end{array}
$$
```

# 积分

$$
f(x) = \int_{-\infty}^\infty  \hat f(x)\xi\,e^{2 \pi i \xi x}  \,\mathrm{d}\xi 
$$

```md
$$
f(x) = \int_{-\infty}^\infty  \hat f(x)\xi\,e^{2 \pi i \xi x}  \,\mathrm{d}\xi 
$$
```


# 三角函数

$$
\sin \alpha + \sin \beta =2 \sin \frac{\alpha + \beta}{2}\cos \frac{\alpha - \beta}{2} 
$$

```md
$$
\sin \alpha + \sin \beta =2 \sin \frac{\alpha + \beta}{2}\cos \frac{\alpha - \beta}{2} 
$$
```

# 统计

$$
\begin{array}{c} 
  S= \binom{N}{n},A_{k}=\binom{M}{k}\cdot \binom{N-M}{n-k} \\ 
  P\left ( A_{k}\right ) = \frac{\binom{M}{k}\cdot \binom{N-M}{n-k}}{\binom{N}{n}} 
\end{array}
$$

```md
$$
\begin{array}{c} 
  S= \binom{N}{n},A_{k}=\binom{M}{k}\cdot \binom{N-M}{n-k} \\ 
  P\left ( A_{k}\right ) = \frac{\binom{M}{k}\cdot \binom{N-M}{n-k}}{\binom{N}{n}} 
\end{array}
$$
```

# 数列

$$
(1+x)^{n} =1 + \frac{nx}{1!} + \frac{n(n-1)x^{2}}{2!} + \cdots 
$$

```md
$$
(1+x)^{n} =1 + \frac{nx}{1!} + \frac{n(n-1)x^{2}}{2!} + \cdots 
$$
```

# 物理

$$
\begin{array}{l}  
  \nabla \cdot \mathbf{D} =\rho _f \\  
  \nabla \cdot \mathbf{B} = 0 \\  
  \nabla \times  \mathbf{E} = -\cfrac{\partial \mathbf{B}}{\partial t }  \\  
  \nabla \times  \mathbf{H} = \mathbf{J}_f +  \cfrac{\partial \mathbf{D}}{\partial t }   
\end{array} 
$$

```md
$$
\begin{array}{l}  
  \nabla \cdot \mathbf{D} =\rho _f \\  
  \nabla \cdot \mathbf{B} = 0 \\  
  \nabla \times  \mathbf{E} = -\cfrac{\partial \mathbf{B}}{\partial t }  \\  
  \nabla \times  \mathbf{H} = \mathbf{J}_f +  \cfrac{\partial \mathbf{D}}{\partial t }   
\end{array} 
$$
```

# 化学

$$
\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\underset{\text{amphoteres Hydroxid}}{\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\underset{\text{Hydroxozikat}}{\ce{[Zn(OH)4]^2-}}$} 
$$

```md
$$
\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\underset{\text{amphoteres Hydroxid}}{\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\underset{\text{Hydroxozikat}}{\ce{[Zn(OH)4]^2-}}$} 
$$
```
