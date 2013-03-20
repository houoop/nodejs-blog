###前言

在基本写完博客功能之后就开始买了VPS，装上Node，开跑。想起来听简单的，但是中间还是问题无数。
###Node的安装
VPS跑得是`Ubuntu Server`，`SSH`上去之后首先就是安装Node。安装Node有两种方式，一是地球人都爱的`APT-GET`，问题就是版本有点老。

那就第二种下载源码自己安装，找到Node的github地址clone一下。

    git clone  git clone git://github.com/joyent/node.git

####Ubuntu Server Git的安装

按下回车后坑爹了，git命令没找到，于是就APT-GET 却更悲剧的发现没有`GIT-CORE`的源，可能是Server版的Ubuntu带的源比较少吧，那就自己加吧。有一个`Sources List`的[在线生成网站](http://repogen.simplylinux.ch/index.php)，可以根据所选Ubuntu版本和所在地理位置生成地址，添加到sources.list中就行了。

    sudo vi /etc/apt/sources.list

下载得到源码之后要安装一些依赖才能编译Node。

    sudo apt-get install git-core curl build-essential openssl libssl-dev
    ./configure –prefix=$HOME/local/node
    make
    sudo make install
    echo 'export PATH=$HOME/local/node/bin:$PATH' >> ~/.profile

还有需要注意的是编译Node的版本，切换版本需要在源码所在文件夹内执行这个语句，否则就是安装最新版，而最新版一般都是pre版，不太稳定。

    git checkout v0.8.5(需要的版本号)

###使用`Forever`部署NodeJS项目

安装好的Node之后可以运行自己的程序了，一般情况下，我们开发nodejs程序都是

    node main.js

但是服务器上运行node命令，SSH一断node进程就退出了，这是我事先没有想到的。于是开始搜索，查到了一些资料说需要开启守护进程，当node因为错误退出后，能够自动重启，配置代码一堆，看得我心里发毛，完全不明白。最后找到一个简单的方法，使用forever组件，自动为脚本开始守护进程。forever安装很简单。

    npm install forever -g

但是安装时候遇到一个问题，forever只支持nodejs到0.8.X版本，而我安装的nodejs是v0.10，于是只好降级到0.8.5版本（stable）。之后就是

    forever start app.js          #启动
    forever stop app.js           #关闭
    forever start -l forever.log -o out.log -e err.log app.js   #输出日志和错误

forever 支持输出到log文件，还有一个比较好的特性

    forever -w  start  xxxx.js

可以支持自动监控文件改变，然后自动重启Node。正好适合我的博客更新方式，使用Git pull一下，就行了。打算再弄一个`Cron`程序，自动定期更新Git项目。



