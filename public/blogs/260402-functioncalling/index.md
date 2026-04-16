## 1. 项目简介
利用agent loop生成训练轨迹，利用LLM as judge对轨迹进行打分，再基于这些打分结果做后续RL训练。mcp server是mock的，会随机产生正确返回结果以及工具调用失败结果，失败信息通常比较接近真实场景下的失败，成功信息则未必能完全代表真实场景下的成功，mock环境很适合用来快速搭建训练闭环、暴露失败模式。

## 2. 数据集介绍
- 数据集来源：大模型合成
- 具体合成思路：首先搭建mcp server，根据所定义的function/tool的定义，调用多个大语言模型，自动生成用户query。
- 缺点：目前来说生成的query都是根据单个tool来生成的，所以query十分简单，导致llm一轮工具调用就可以完成任务，而没有多步规划和跨步记忆，属于弱agentic RL。
- 改进：把数据从“单工具即可完成”升级为需要调用多个工具

## 3. 模型介绍

## 4. 训练脚本
### 4.1 环境变量
``` bash
export RULER_MAX_SUB_BATCH=12               #rollout子批大小
export RULER_CONCURRENT_CHUNKS=16           #并发生成chunk数
export RULER_MAX_COMPLETION_TOKENS=20480    #最大生成长度
export RULER_JUDGE_MODEL="gpt-5-mini"       #用哪个LLM做reward
```
这些属于RULER（评测/打分组件）配置。

### 4.2 核心命令入口
``` bash
python3 -m verl.trainer.main_ppo
```
使用对应环境的python运行verl/trainer/main_ppo.py代码
### 4.3 数据相关参数
``` bash
data.train_files=...train.parquet
data.val_files=...test.parquet
```
使用的工具调用数据集，构造成了parquet格式，通常结构为：prompt、tool calls、extral。
``` bash
data.train_max_samples=4096         #最多用4096条训练数据                         
data.train_batch_size=128           #每个训练step的batch size
data.max_prompt_length=4096         #最大允许构造的prompt长度
data.max_response_length=2048       #模型被允许回复的最大长度
data.filter_overlong_prompts=True   #过滤掉超过最大长度的prompt
data.truncation='error'             #超过长度的不截断，直接认为报错
```
.
``` bash
+data.apply_chat_template_kwargs.enable_thinking=False      #不启用Qwen的思考模式
```
.
``` bash
tool_config_path=examples/sglang_multiturn/config/tool_config/ugreen_mcp_tool_config.yaml
data.tool_config_path=${tool_config_path} \
```
定义了工具的schema以及tool calling的格式，在该项目中是tools是verl的类：verl.tools.mcp_base_tool.MCPBaseTool，即mcp的形式，端口位于http://localhost:8000/mcp。

### 4.4 模型相关
``` bash
model=Qwen/Qwen3.5-4B
actor_rollout_ref.model.path=${model}
```
训练模型采用qwen3.5-4B，三个角色共享这个模型，包括actor、rollout、ref。
``` bash
actor_rollout_ref.model.enable_gradient_checkpointing=True
actor_rollout_ref.model.use_remove_padding=True
```
开启梯度检查点，即不保存中间梯度结果，反向传播时重新计算，节省显存；
训练期间移除输入的padding元。
### 4.5 PPO/GRPO训练核心
``` bash
algorithm.adv_estimator=grpo
actor_rollout_ref.actor.policy_loss.loss_mode=gspo
actor_rollout_ref.actor.ppo_mini_batch_size=2
```
RL算法采用GRPO，对应的损失采用GSPO。
ppo内部的mini batch size设置为2，
``` bash
actor_rollout_ref.actor.use_kl_loss=True
actor_rollout_ref.actor.kl_loss_coef=0.001
actor_rollout_ref.actor.kl_loss_type=low_var_kl
actor_rollout_ref.actor.entropy_coeff=0
```
使用KL正则，防止模型偏离太快，使用低方差KL（更稳定），不加探索entropy。
### 4.6 分布式训练
``` bash
actor_rollout_ref.actor.strategy=fsdp2
actor_rollout_ref.actor.fsdp_config.model_dtype=bf16
wrap_policy.transformer_layer_cls_to_wrap="['Qwen3_5DecoderLayer']"
trainer.n_gpus_per_node=4
```
使用FSDP v2模式；采用bfloat16；指定特定层做FSDP shard，否则不会正确分片；4卡训练。
### 4.7 rollout配置
``` bash
actor_rollout_ref.rollout.name=vllm
actor_rollout_ref.rollout.tensor_model_parallel_size=4
actor_rollout_ref.rollout.mode=async
actor_rollout_ref.rollout.temperature=1.05
actor_rollout_ref.rollout.n=5
```
- 推理框架选择vllm
- vllm tensor parallel选择4卡
- rollout异步执行（训练+推理并行）
- 生成更加随机（利于探索）
- 每个prompt生成5个候选

### 4.8 工具调用
``` bash
actor_rollout_ref.rollout.agent.default_agent_loop="tool_agent"
actor_rollout_ref.rollout.multi_turn.tool_config_path=...
actor_rollout_ref.rollout.multi_turn.format=qwen3_coder
actor_rollout_ref.rollout.engine_kwargs.vllm.tool_call_parser="qwen3_coder"
```
- 使用tool agent
- 第二个确定tool的config位置，但是不确定有没有开启multi-turn
- tool call的风格采用Qwen风格
- 解析tool call json的设置

### 4.9 Reward
``` bash
custom_reward_function.path=./verl/utils/reward_score/llm_reward/llm_score_gpt.py
custom_reward_function.name=compute_score_batch
reward_model.reward_manager=batch
```
打分函数的路径位置。
### 4.10 训练控制
``` bash
trainer.total_epochs=1                  #只训练1轮
trainer.save_freq=10                    #保存/测试频率
trainer.test_freq=50                    
trainer.resume_mode='auto'              #自动断点恢复
trainer.logger='["console","swanlab"]'  #日志，放在控制台、swanlab
```

## 5. 训练源码解读
因为我们对ray不熟悉，所以我们本次解读直接跳过所有infra的部分，如果未来真打算弄懂infra了，我们再回来解读。

### 5.1 main_ppo.py
关键函数有三个：
- main()：入口
- run_ppo()：初始化Ray，然后创建TaskRunner
- TaskRunner.run()：真正把训练系统搭起来

#### 5.1.1 main()
main只有三行代码：
1. auto_set_device(config) 自动决定设备类型，比如 CUDA / NPU。
2. migrate_legacy_reward_impl(config) 把旧版 reward 配置迁移到新版字段，因为在不断更新中字段会被移到别的地方，但示例脚本没有更新，所以向后兼容。
3. run_ppo(config) 开始真正训练。

#### 5.1.2 run_ppo()
1. 首先判断ray是否被初始化，如果没有，就先进行ray.init()
2. 创建一个远程TaskRunner()
3. 调用runner的run函数

#### 5.1.4 TaskRunner.run()
注册所有训练角色的 Worker 类，以及建立角色与资源池的映射关系。
1. 首先调用add_actor_rollout_worker(config)，判断actor/rollout worker 用哪种实现，是FSDP/FSDP2、megatron还是veomni
2. 接着调用add_critic_worker(config)，先决定 critic worker 要不要建（是否GAE），再通过use_legacy_worker_impl来判断是使用旧的worker还是新的worker，新的适合agent。
3. 接着调用add_reward_model_resource_pool(config)，判断奖励模型是公共池还是单独（不管）
4. 调用add_ref_policy_worker(config, actor_rollout_cls)，根据是否在奖励和损失中都使用kl散度来决定建ref policy worker
5. 加载tokenizer和processor
6. 调用create_rl_dataset()来进行训练集和验证集的构造
7. 调用create_rl_sampler()来进行采样器的构造
8. 实例化RayPPOTrainer()，传入对应的参数
9. trainer.init_workers()
10. trainer.fit() 开始训练

### 5.2 rl_dataset.py
该文件中三个关键点：
- get_dataset_class(...)
- RLHFDataset
- collate_fn(...)
#### 5.2.1 get_dataset_class
在main_ppo.py中调用了get_dataset_class(data_config)，先判断用户是否指定了数据集的类型，没有指定的自定义类就使用RLHFDataset类。
#### 5.2.2 RLHFDataset
首先初始化各种参数，如果传入了tool_config_path，那么就会有tool_shemas，初始化完毕后，首先运行`_download`和`_read_files_and_tokenize`：
1. 读取parquet/json/jsonl
2. 如果配置了 train_max_samples，就先截取
3. 如果 filter_overlong_prompts=True，就先过滤超长 prompt
最重要的是__getitem__()返回什么：
1. row_dict["raw_prompt"] = self._build_messages(row_dict) 把 parquet 里的 prompt 变成 message list。
2. 放一个 dummy_tensor 这是为了兼容当前 DataProto.batch 不能为空。
3. 把index、tools_kwargs、interaction_kwargs也塞进去
4. 最后返回row_dict这个字典

#### 5.2.3 collate_fn
在创建RayPPOTrainer时还会传入collate_fn函数，经过collate_fn后，会把一个batch分成两类：
- tensor字段 -> torch.stack
- 非tensor字段 -> np.ndarray(dtype=object)
所以后面trainer/rollout里我们会看到两块数据：
- batch.batch 放 tensor，例如 prompts、responses
- batch.non_tensor_batch 放 Python 对象，例如 raw_prompt、tools_kwargs、uid
这就是 DataProto 在这个项目里的基本使用方式。

### 5.3 RayPPOTrainer
这是训练总调度器， 它自己不直接做大模型前向和反向，而是负责调用各个 Ray worker，把一轮 PPO/GRPO 数据流串起来。
关键函数：
- init_workers()
- fit()
RayPPOTrainer在初始化时调用_create_dataloader()，构造train_dataloader和val_dataloader。
#### 5.3.1 init_workers
1. 创建actor和rollout，训练侧actor/ref用FSDP2，rollout侧用vLLM，actor和rollout属于hybrid engine结构。
2. 创建critic模型（GRPO不需要）
3. 创建ref模型
4. 初始化WorkerGroup
5. 初始化reward loop manager，负责启动若干reward loop worker，在需要的时候给轨迹打分
6. 创建AgentLoopManager，负责启动rollout server，启动agent loop worker，把batch分发给agent loop worker去做工具调用式rollout
7. 创建CheckpointEngineManager，把训练更新后的权重同步给rollout引擎

#### 5.3.2 fit
这基本就是“一次训练step的完整剧本”：
1. 先加载checkpoint，然后同步权重到rollout。

    训练刚开始时会做：`_load_checkpoint()`和`self.checkpoint_manager.update_weights(self.global_steps)`，也就是说rollout引擎总会先拿到一份当前 actor 权重。

2. 从dataloader取一批prompt。

    每轮循环`for batch_dict in self.train_dataloader`和`batch = DataProto.from_single_dict(batch_dict)`，然后它会给每个样本分一个唯一的uid，后面GRPO需要知道哪5条response是同一个prompt采样出来的，应该分在同一组做相对比较。

3. 生成前先裁掉不需要的字段。

    trainer不会把所有训练字段都扔给rollout，`_get_gen_batch()`会把真正需要的字段抽出来，并保留reward相关信息。

4. 同一个prompt复制5次，分别独立rollout，怎么rollout呢：

    首先在fit()里会调`gen_batch_output = self.async_rollout_manager.generate_sequences(gen_batch_output)`，这里的async_rollout_manager实际上就是AgentLoopManager。

    然后在AgentLoopManager中，会把大batch切块，分发给多个AgentLoopWorker，等结果回来后`_postprocess(...)`，最终会把每个样本的 rollout 结果整理成统一的 DataProto，至少包括：prompts、responses、response_mask、input_ids、attention_mask、position_ids、rollout_log_probs，如果reward已经在rollout阶段异步算好了，他还会直接把rm_scores一起放进batch。由于我们设置了`actor_rollout_ref.rollout.agent.default_agent_loop="tool_agent"`，所以默认每个样本都会走ToolAgentLoop。

    在ToolAgentLoop中，初始化阶段需要读取multi_turn.tool_config_path，然后初始化工具，选择tool parser。ToolAgentLoop.run() 不是“一次生成就结束”，而是一个循环状态机：`_handle_generating_state()`会调用底层vLLM server去生成token，生成完之后他会做几件事，把输出token追加到agent_data.response_ids，记录response_logprobs，用tool parser 从模型输出里抽取 tool calls，如果有tool call，就进入工具调用环节，否则结束

    `_handle_processing_tools_state()`遍历本轮解析出的 tool calls，并发执行，返回tool消息，拼接prompt返回GENERATING模式。

    `response_mask`的存在是为了让工具返回文本会进入上下文， 但不会被当成“模型自己采样出来的 action token”去优化。

5. 在 `AgentLoopWorker._compute_score(...)` 里：如果rollout输出里还有没有reward_score，并且`reward_loop_worker_handles`不为空，就会挑一个reward loop worker计算奖励。
6. 奖励计算

    在llm_score_gpt.py中，会读取每条轨迹的 messages，从tools 构造 rubric，让一个 judge model 对同组轨迹做相对评分，返回这一组分数。

7. 计算old log prob / ref log prob

    在reward拿到之后，我们先调用actor worker的compute_log_prob，得到old_log_probs和entropys，然后再算ref的

8. 计算advantage

    先算每条轨迹总reward，然后按uid分组，组内算mean/std，每条轨迹减去组均值，再按需除以组内std，最后得到的 advantages 和 returns 会扩展到 token 维度。

9. actor更新：使用GSPO + KL loss

    每轮actor更新大概是：

    首先选出训练所需要的字段：responses、response_mask、input_ids、attention_mask、position_ids、old_log_probs、advantages和ref_log_prob

    然后按ppo_mini_batch_size切mini-batch

    每个mini-batch再按ppo_micro_batch_size_per_gpu或者dynamic batch切micro-batch

    每个micro-batch前向得到新的log_prob

    计算policy loss

    如果配置了KL loss，再加KL，然后backward、optimizer step，lr scheduler。


到这里就基本解读完了，先这样吧，燃尽了。。。。
