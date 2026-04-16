## 安装
主要包括两个步骤：
1. Java安装
2. neo4j安装
看文档根据neo4j的版本确定java的版本
## 端口
localhost:7474
## 常用命令
``` python
#启动
sudo systemctl start neo4j

#停止
sudo systemctl stop neo4j

#重启
sudo systemctl restart neo4j

#查看状态
sudo systemctl status neo4j

#查看日志
sudo journalctl -u neo4j -f
```
## 切换数据库
因为免费的社区版不支持创建数据库，所以能用的其实只有neo4j一个数据库，按理来说是可以用的，但是当你删除节点后，其中的Property keys并不会消失，就会导致很难看，因此可以采用一些其他的办法进行创建数据库。

1. 找到neo4j.conf文件，ubuntu系统在etc/neo4j文件夹下
2. 修改initial.dbms.default_database=新的名称
3. 重启neo4j系统后，就会发现新创建了一个数据库
