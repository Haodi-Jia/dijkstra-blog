## 1 简介
Python包管理生态中存在多种工具，如pip、poetry、conda等，各自具备一定的功能。但是大家往往在使用的时候会发现，天天`pip -r requirements.txt`，然后各种依赖报错，复现的第一步就出现问题，很难不怀疑论文造假。

当时学前端的时候就在想，为什么python没有想npm那样的包管理方式，后来就发现了uv，简直发现了新大陆。

与其他Python中的包管理工具相比，uv更像是一个全能选手，他的优势在与：
1. 速度快：得益于Rust，uv工具安装依赖比其他工具快的多，而且是多线程
2. 功能全面：uv是“一站式服务”的工具，从安装 Python、管理虚拟环境，到安装和管理包，再到管理项目依赖，它统统都能处理得很好
3. 前景光明：可lock的环境一定是未来的标配

话不多说，我们开始进行安装以及学习吧

## 2 安装uv

安装uv非常简单，可以使用官方提供的安装脚本，也可以通过pip来安装。
``` bash
# On macOS and Linux.
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows.
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# With pip.
pip install uv
```
通过pip来安装的话，建议全局安装python，python自带pip包，这时候就可以`pip install uv`来安装uv。

安装之后，可以通过`uv help`命令检查是否安装成功。

## 3 使用uv
首先，介绍uv工具主要使用的两个文件：
- `pyproject.toml`：定义项目的主要依赖，包括项目名称、版本、描述、支持的Python版本等信息
- `uv.lock`：记录项目的所有依赖，包括依赖的依赖，且跨平台，确保在不同环境下安装的一致性。这个文件由 uv 自动管理，不要手动编辑

### 3.1 创建项目
创建一个项目，使用`uv init <project dir>`命令。

这样会得到一个文件夹：
``` bash
$  uv init myproject
Initialized project `myproject` at `D:\projects\python\myproject`

$  cd .\myproject\

$  ls


    目录: D:\projects\python\myproject


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        2024/12/27  12:06:08            109 .gitignore
-a----        2024/12/27  12:06:08              5 .python-version
-a----        2024/12/27  12:06:08             87 main.py
-a----        2024/12/27  12:06:08            155 pyproject.toml
-a----        2024/12/27  12:06:08              0 README.md

```
包含了git管理，python的版本号，readme文件，依赖文件和main示例入口。

### 3.2 安装依赖

当我们确定使用的python版本（如要修改，在.python-version和pyproject.toml中修改），我们就可以安装依赖，创建虚拟环境。使用命令：
``` bash
uv sync
    Using CPython 3.12.4 interpreter at: D:\miniconda3\envs\databook\python.exe
    Creating virtual environment at: .venv
    Resolved 1 package in 15ms
    Audited in 0.05ms
```

对于别人的项目，如果他也是uv配置的环境，如果上传了uv.lock文件，那么我们就可以直接运行`uv sync`命令，而不需要`uv init`，直接安装依赖。

运行完成后，会出现`.venv`文件夹，里面存放了启动环境的命令以及项目依赖。

### 3.3 运行项目

在conda环境中，我们一般是先activate对应环境，然后使用python命令运行脚本。

在uv中，我们也可以这样做，首先启动环境：
``` bash
# linux
source .venv/bin/activate

# windows
.venv\Scripts\activate.bat
```
然后运行某个脚本：
``` bash
python main.py
```

当然，我们也可以使用uv所特有的方式：
``` bash
uv run main.py
```

这样就相当于自动使用uv的环境运行main脚本。

### 3.4 管理依赖

管理依赖是我们使用uv的主要目的，使用uv添加依赖非常简单，和npm以及cargo差不多。
``` bash
uv add pandas
```
使用add命令添加依赖，并且会自动更新pyproject.toml和uv.lock文件。其中uv.lock文件记录了依赖的下载源，方便一键复现。

当然我们也可以不使用add命令：
``` bash
uv pip install pandas
```
但是这样不会被记录到uv.lock中，别人就无法一键拉取，常用于安装你下载的whl本地文件依赖。

删除依赖使用：
``` bash
uv remove pandas
```

## 4 区分开发环境和生成环境

还有一个比较常用的功能是区分开发环境和生产环境的依赖，这个功能在NodeJS和Rust中很常见。

比如，我们想把pandas安装到开发环境中，而把requests安装到生产环境中。

``` bash
uv add --group dev pandas
uv add --group prod requests
```
安装之后，uv.lock 文件自动添加了各个包及其依赖，这里不再赘述。

从项目的pyproject.toml中可以看出不同环境的包依赖。
``` bash
$  cat .\pyproject.toml
[project]
name = "myproject"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []

[dependency-groups]
dev = [
    "pandas>=2.2.3",
]
production = [
    "requests>=2.32.3",
]

```