# *minisys*-ide

## 开始使用

- 安装

  ```shell
  $ git clone git@github.com:seu-cs-class2/minisys-ide.git
  $ cd minisys-ide
  $ npm install
  ```

- 启动

  ```shell
  $ npm run start
  ```

  你也可以下载 [Release](https://github.com/seu-cs-class2/minisys-ide/releases) 版本来进行二进制安装。

## 开发笔记

### 全局 Property

| 属性名          | 作用                                                         |
| --------------- | ------------------------------------------------------------ |
| openedDocs      | 当前侧边栏上部打开的文件的属性，`{path, name, modified, session}` |
| currentPath     | 当前打开的文件夹路径                                         |
| currentFilePath | 当前打开（正在展示）的文件的路径                             |

