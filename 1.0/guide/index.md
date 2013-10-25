## 综述

cn-money是。

* 版本：1.0
* 作者：bofang.zxj
* demo：[http://gallery.kissyui.com/cn-money/1.0/demo/index.html](http://gallery.kissyui.com/cn-money/1.0/demo/index.html)

## 初始化组件

    S.use('gallery/cn-money/1.0/index', function (S, CnMoney) {
        console.log(CnMoney.convert(12021));
    });

## API说明
convert 接受两个参数
* 第二个是处理的小数位数，最多6位，分别是  **角, 分, 厘 ,毫,丝,忽** ，所以可以这么使用


```
	//得到的结果是 壹仟贰佰叁拾肆元壹角贰分叁厘
	CnMoney.convert(1234.1234,3);
```


* 第一个是需要转换的数字，可以传递字符串和数字，最多能够处理到千万亿位，即16位
参数值传递不合法，直接返回false
