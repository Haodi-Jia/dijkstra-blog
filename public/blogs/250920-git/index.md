## 一、环境检查与基础配置

### 1. 检查 Git 是否安装

默认已经安装 Git，可以通过以下命令检查：

```bash
git --version
```

如果成功，会返回 Git 的版本号。

---

### 2. 配置用户名和邮箱

```bash
git config --global user.name haodi-jia  # 填写你的 GitHub 用户名
git config --global user.email 396310954@qq.com  # 填写你的邮箱
```

---

### 3. 配置代理（用于访问 GitHub）

如果直接连接 GitHub 较慢或失败，可以配置代理：

```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy https://127.0.0.1:7890
```

> ⚠️ 注意：`7890` 端口需要根据你的代理工具（如 Clash）进行调整。

---

### 4. 查看 Git 配置

```bash
git config --list
```

可以看到所有当前配置。

---

## 二、SSH 配置（推荐）

### 1. 生成 SSH 密钥

```bash
ssh-keygen -t rsa -C "396310954@qq.com"
```

一路回车即可生成密钥。

---

### 2. 添加 SSH Key 到 GitHub

* 打开路径：

  ```
  C:/Users/你的用户名/.ssh/id_rsa.pub
  ```
* 用文本打开并复制内容
* 登录 GitHub：

  * Settings → SSH and GPG keys → New SSH key
  * Title：自定义（如 work / autodl）
  * Key：粘贴复制的内容

---

### 3. 验证 SSH

```bash
ssh -T git@github.com
```

如果看到：

```bash
Hi xxx! You've successfully authenticated, but GitHub does not provide shell access.
```

说明配置成功。

---

### ⚠️ SSH 连接卡住问题（常见于 autodl）

如果连接卡住，可能是 22 端口被限制，可以修改配置：

```bash
Host github.com
    HostName ssh.github.com
    Port 443
    User git
    IdentityFile ~/.ssh/id_ed25519
```

Linux 使用：

```bash
nano ~/.ssh/config
```

Windows 可直接创建该文件。

---

## 三、克隆仓库

使用 SSH 方式克隆（推荐）：

```bash
git clone git@github.com:Haodi-Jia/satelite_assistant.git
```

---

## 四、分支开发流程（推荐方式）

> 不再直接在 main 分支开发，统一使用分支操作
如果不使用分支的话，直接在main分支修改代码，然后：
``` bash
git status
git add .
git commit -m ""
git push origin main
#然后再另一台电脑上
git pull origin main
```
即可，只用于自己的代码时可以。协作必须走分支开发流程。

---

### 1. 查看当前分支

```bash
git branch
```

---

### 2. 创建并切换分支

```bash
git checkout -b haodi-branch
```

---

### 3. 拉取最新代码

```bash
git pull origin main
```

---

### 4. 修改代码后提交

```bash
git status
git add .
git commit -m "new:process result view"
```

---

### 5. 推送到远程分支

```bash
#每次push前先pull，确保push的时候没有冲突
git pull origin main
#推送到远程分支
git push origin haodi-branch
```

---

## 五、同步代码（避免冲突）

如果你在pull的时候发现失败了，报错为：
``` bash
error: 您对下列文件的本地修改将被合并操作覆盖： 
    verl/trainer/config/ppo_trainer.yaml 
请在合并前提交或贮藏您的修改。 
正在终止
```
那么就是 main 分支的一些文件跟你修改的冲突了，例如伙伴先merge了，你改了readme.md，他也改了，或者没改，都会有覆盖的报错。

处理方法：

``` bash
git stash        # 暂存当前修改
git pull origin main
git stash pop    # 恢复修改
```

然后手动解决冲突，再提交：

```bash
git add .
git commit -m "fix: resolve conflict"
git push origin haodi-branch
```

---

## 六、Pull Request（PR）流程

1. push 分支后，进入 GitHub 仓库
2. 点击 **Pull Request**
3. 选择：

   * base：main
   * head：你的分支（如 haodi-branch）
4. 填写标题和描述
5. 提交 PR
6. 等待 review 并 merge

---

## 七、合并后清理分支

```bash
git checkout main
git branch -d haodi-branch
git pull origin main
```

---

## 八、总结流程（推荐实践）

```bash
git checkout -b xxx-branch
git pull origin main
# 修改代码
git status
git add .
git commit -m "your message"
# 先pull后push，有冲突stash
git pull origin main
git push origin xxx-branch
# 创建 PR → merge
git checkout main
git pull origin main
git branch -d xxx-branch
```

---

这样可以保证：

* 主分支稳定
* 协作清晰
* 冲突最小化
