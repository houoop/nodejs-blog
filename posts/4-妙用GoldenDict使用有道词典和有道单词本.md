###GoldenDict说明

GoldenDict是一个既星际译王之后很不错的词典，很重要的一点是它的渲染是使用webkit引擎做的，而众所周知webkit是非常著名的浏览器渲染引擎，今天实现的这一功能就是以它的这一特性为前提。

GoldenDict支持很多词典包，但是却缺乏在线词典，语音也支持的不好，而现在有很多在线词典网站，有很好的词库和语音支持。GoldenDict有一个很好的扩展机制能够直接调用网页进行显示。后来我找到了一个eyoudao的插件可以调用有道的API进行查询，但是却没有网站上提供的单词本功能。于是我就自己动手丰衣足食了。

###开始折腾
如果直接使用GoldenDict的Directory里添加如下URL

    http://dict.youdao.com/search?le=eng&q=%GDWORD%&keyfrom=dict.top

界面显示会是这个样子

![](/assets/img/post4/DeepinScreenshot20130408125427.png)

界面上的杂乱信息太多，还有广告，这肯定不是我想要的结果，于是我把它放到一个本地HTML的iFrame里显示，再设置一些负边距，

    <!DOCTYPE html>
    <html>
    <head>
        <meta charset=utf-8 />
        <style>
            iframe{ width: 706px; height: 650px; margin-top:-190px; margin-left:-120px;
            }
        </style>
    </head>
    
    <body>
        <iframe id="a" frameborder="0">
        </iframe>
        <script>
        var word = location.href.slice(location.href.indexOf('?a')+3);
        document.getElementById('a').setAttribute(
            'src', 
            'http://dict.youdao.com/search?le=eng&q=' + word + '&keyfrom=dict.top');
        </script>
    </body>
    </html>

那么结果就会是这个样子

![](/assets/img/post4/DeepinScreenshot20130408124051.png)

把上面的HTML代码保持到本地的html文件里。现在我们需要在Diretory里面设置一下URL为下面的地址，具体路径根据你保存的位置决定，最经典的方法是用浏览器打开本地html，地址栏了就显示地址了，但是记住一定要加?a=%GDWORD%，用于获取参数。

    file:///home/zhangyang/Project/dict.html?a=%GDWORD%
    
![](/assets/img/post4/DeepinScreenshot20130408124132.png)

OK，主要工作完成了。需要提出的一点是，如果你需要使用单词本，是需要登陆一个网易账户的，现在因为很多东西都隐藏了，不好登陆，所以还是需要在有道原始的界面登陆好（设置一下记住登陆,还有用户名密码无法直接输入，但是可以复制粘贴）之后，再切换到改造的界面当中。

###实现更多的需求
这个方法适用于各种在线词典，需要可以自己DIY。