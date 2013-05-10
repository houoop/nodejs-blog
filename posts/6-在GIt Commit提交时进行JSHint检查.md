###JSHint的选项配置

jshint是jslint的一个分支,在实际编码过程中,jslint的检查语法过于严格.而jshint的使命就是提供一些配置关闭一些不必要的检查,下面一些jshint提供的配置,这些设置默认都是false,右边的说明为当设置为true时的作用

    asi------------无视没有加分号的行尾。
    bitwise--------禁用位运算符。
    boss-----------允许在if，for，while里面编写赋值语句。
    curly----------在使用if和while等结构语句时加上{}来明确代码块。
    debug----------允许代码中出现debugger的语句。
    eqeqeq---------禁止使用==和!=,提倡使用===和!==。
    eqnull---------允许使用"== null"作比较。
    evil-----------允许使用eval。
    laxbreak-------不会检查换行。
    Javascript-----会通过自动补充分号来修正一些错误，因此这个选项可以检查一些潜在的问题。
    maxerr---------设定错误的阈值，超过这个阈值jshint不再向下检查，提示错误太多。
    newcap---------要求每一个构造函数名都要大写字母开头。
    noarg----------禁止arguments.caller和arguments.callee的使用。
    noempty--------禁止出现空的代码块（没有语句的代码块）。
    nomen----------禁用下划线的变量名。
    onevar---------期望函数只被var的形式声明一遍。
    passfail-------发现首个错误后停止检查。
    plusplus-------禁用自增运算和自减运算。
    regexp---------不允许使用.和[^...]的正则，
    undef----------要求所有的非全局变量，在使用前都被声明。
    sub------------允许各种形式的下标来访问对象。
    strict---------要求使用use strict;语法。
    white----------严格的空白规范检查你的代码。

###关于Git Hooks

钩子(hooks)是一些在"$GIT-Project/.git/hooks"目录的脚本, 在被特定的事件触发后被调用。当"git init"命令被调用后, 一些非常有用的示例钩子文件(hooks)被拷到新仓库的hooks目录中; 但是在默认情况下这些钩子(hooks)是不生效的。 把这些钩子文件(hooks)的".sample"文件名后缀去掉就可以使它们生效了。

####Git pre-commit

这个钩子被 'git-commit' 命令调用, 而且可以通过在命令中添加--no-verify参数来跳过。这个钩子没有参数，在得到提交消息和开始提交(commit)前被调用。如果钩子执行结果是非零，那么 'git-commit' 命令就会中止执行。

###Git Commit之前进行JSHint检查

    #!/usr/bin/env python
    
    import os, sys
    
    """
    Checks your git commit with JSHint. Only checks staged files
    """
    def jshint():
        
        errors = []
        
        # get all staged files
        f = os.popen('git diff --cached --name-only --diff-filter=ACM')
        
        for file in f.read().splitlines():
    
            # makes sure we're dealing javascript files
            if file.endswith('.js'):        
    
                g = os.popen('jshint ' + file)
            
                # add all errors from all files together
                for error in g.readlines():
                    errors.append(error)
        
        # got errors?
        if errors:
            for i, error in enumerate(errors):
                print error,
    
            # Abort the commit
            sys.exit(1) 
        
        # All good
        sys.exit(0) 
        
    if __name__ == '__main__':
        jshint()
        
将上面的代码保存为pre-commit文件到需要在commit时执行lint的项目文件的的.get/hooks(隐藏文件)文件夹中即可。下次进行commit时就会开始检查,这样有助于团队讲的代码风格统一。
