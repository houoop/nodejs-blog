###Compass安装
	
`Compass`是一个功能强大的CSS工具集，功能太多，我现在还没看完，今天主要说的是`CSS Sprite`的功能，有了Compass,做雪碧图再也不是麻烦事了。

Compass使用ruby编写，因此安装compass必须安装ruby，然后使用gem安装即可

	gem install compass

###Sprite基本用法

一般把需要合成的图片放到一个单独的文件夹中例如ICON,然后在`SASS`文件中写入

	@import "image/ICON/*.png";
	@include all-ICON-sprites;

你也可以不放在单独的文件夹中，使用选择器来指定需要的图片，选择器的名称就是图片的名字

	@import "image/*.png";

	.new    { @include image-sprite(new);    }
	.edit   { @include image-sprite(edit);   }
	.save   { @include image-sprite(save);   }
	.delete { @include image-sprite(delete); }

###内建功能函数

<map>-sprite-width，<map>-sprite-height函数用来获取图片的宽高，<map>的意思就是sprite文件夹的名字，这样就得到合成出的图片的宽高。

###自定义选项

compass sprite包含丰富的选项用于满足各种需求，<map>是文件夹的名称

	$<map>-spacing #用于设置图片的周围空白大小默认0px
	$<map>-repeat #设置图片是否平铺，例如$icon-repeat: repeat-x
	$<map>-sprite-dimensions #是否输出每个图片的大小到css中 默认false
	$<map>-clean-up #是否删除旧的合成图
	$<map>-position #合成图位置，0px是左对齐，100%是右对齐，50%是居中对齐
	$<map>-sprite-base-class #设置生成css类的父类
	$<map>-layout #合成图的布局，四个值可选： horizontal、diagonal、vertical、smart分别为横向，对角线，垂直，智能选择

sprite是单个图片的名称，可以为每个图片单独设置选项

	$<map>-<sprite>-spacing: 5px #例子  

@include all-ICON-sprites，这一语句会使compass在合成图片后，为每个图片生成一个.sprites-<map>-<sprite>的CSS类，如果你不需要的话不需要这句代码，想要在自己的CSS类中设置background-size，需要在代码中加入

	@import "buttons/*.png";

	.submit-button {
  		@include buttons-sprite(button-hover) #引入button-hover.png的background-size
	}
