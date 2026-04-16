## 起始总结

Qwen3.5公开了 Qwen-3.5（Dense） 和 Qwen-3.5-MOE 两类多模态模型。这篇文章重点讲解Qwen-3.5的模型创新。
- Qwen-3.5 (Dense)：使用了Qwen3-Next中的混合架构，每三层标准注意力插入1层线性注意力。在Qwen3-Next的基础上接入 ViT 和 PatchMerger 模块，从而同时支持纯文本和多模态输入。
- Qwen-3.5-MOE：将Dense模型的LLM 主干网络中的FFN 替换为了 Qwen3 中的 MoE 架构。

## Qwen3-Next

在分析Qwen3.5之前，先看下Qwen3-Next中的架构。

1. 混合注意力机制 (Hybrid Attention)：每 4 层中包含 3 层 线性注意力 和 1 层 标准注意力。线性注意力打破了标准注意力的二次方复杂度，极大提升了处理长文本时的效率，而保留部分标准注意力层则确保了强大的推理和召回能力。
> 标准注意力的额外设计：（1）沿用前作 Gated attention中的输出门控机制，缓解注意力中的低秩问题。（2）将单个注意力头维度从128扩展256。（3）仅对注意力头前 25% 的位置维度添加旋转位置编码，提高长度外推效果。
2. MoE模型：总参数量高达 80B，但每处理一个 Token 仅激活 3B 参数。包含 512 个路由专家 和 1 个共享专家，每次激活 10 个专家。
3. 长文本处理能力：原生支持256K的上下文窗口，可以通过YARN进一步扩展至1M。
4. 训练稳定性：针对 Qwen3中使用的 QK-Norm 出现的部分层Norm weight值异常高的现象，进一步采用了Zero-Centered RMSNorm + weight decay的方法，避免权重无界增长。此外还在初始化时归一化MoE router的参数，确保每个 expert 在训练早期都能被无偏地选中，减小初始化对实验结果的扰动。
> Qwen3 中使用传统的 QK-Norm时，部分Norm的权重（即可学习的缩放因子 $$\gamma$$）会变得异常大。这种权重的无限制增长会导致数值不稳定。为了解决上述问题，Qwen3-Next 对归一化层做了两项关键改进：
> 零中心化 (Zero-centered)：传统的 RMSNorm 只缩放不平移，而零中心化版本确保了输出分布的均值为 0。有效防止了激活值的偏移，有助于消除Attention Sink和Massive Activation现象，确保数值在深层网络中保持稳定。
> 权重衰减 (Weight-decay)：显式地对QK-Norm的超参数$$\gamma$$Weight Decay，防止权重无限制增长。
5. 极致的效率表现
    - 训练效率：仅使用 Qwen3-32B 训练成本的 10%，便在多个下游任务中实现了反超。
    - 推理速度：引入 MTP 机制，支持一次推理生成多个 Token，进一步优化投机采样的效率。

## Qwen3.5模型架构

Qwen3.5 是一个 Causal LM with Vision Encoder模型。

多模态架构去除了Qwen3-VL中的DeepStack架构，仍采用传统的ViT + PatchMeger + LLM的架构。

LLM模块总共60层，包含 15 个循环块，每个循环块包含 $$3 \times (\text{Gated DeltaNet} )$$ 和 $$1 \times (\text{Gated Attention} )$$

- Gated DeltaNet： 64 个用于 V 的线性注意力头，以及 16 个用于 QK 的头。注意力头维度128。这种设计倾向于大词表（Embedding 维度 248,320）下的快速特征提取。
- Gated Attention： 采用GQA，2个Q头和2个KV头，注意力头维度256，RoPE 嵌入维度为 64。

MoE模型总共 512 个专家，每次推理仅激活10个路由专家+1个共享专家，专家中间维度1024。总参数量为 397B，实际激活参数量 17B。

## Qwen3.5核心代码解读

### MRoPE

之前提到，Qwen3.5只仅对注意力头前 25% 的位置维度添加旋转位置编码。因此首先关注Qwen3_5TextRotaryEmbedding类。Qwen3.5采用了Qwen-VL系列一直采用MRoPE，支持T/H/W三个维度。

1. 初始化方法中关注几个变量：
    - mrope_section：默认[11, 11, 10]，MRoPE分段长度，对应T/H/W三个维度
    - partial_rotary_factor：默认0.25，即只对QK矩阵的1/4的维度旋转以减少计算量。每个注意力头的维度head_dim=256，这里实际旋转维度dim=256*0.25=64。
    - inv_freq：$$\theta_i = 1 / (10000^{2i/d})$$ ，MRoPE 逆频率D=[dim//2]=32（只计算偶数维度，因为成对旋转）
2. 接下来关注forward函数，在矩阵乘法计算每个维度的旋转角度后，应用交错MRoPE，从分块布局 [TTT...HHH...WWW] 重组为交错布局 [THWTHWTHW...TT]，最后计算cos和sin。
``` python
def forward(self, x, position_ids):
    # ...
    # [3, bs, D, 1]
    inv_freq_expanded = self.inv_freq[None, None, :, None].float().expand(3, position_ids.shape[1], -1, 1)
    # [3, bs, 1, seq_len]
    position_ids_expanded = position_ids[:, :, None, :].float()  
    with maybe_autocast(device_type=device_type, enabled=False): 
        # [3, bs, seq_len, D] 
        freqs = (inv_freq_expanded.float() @ position_ids_expanded.float()).transpose(2, 3)
        # [bs, seq_len, D] 
        freqs = self.apply_interleaved_mrope(freqs, self.mrope_section)
        # (bs, seq_len, dim)
        emb = torch.cat((freqs, freqs), dim=-1)
        cos = emb.cos() * self.attention_scaling
        sin = emb.sin() * self.attention_scaling
    return cos.to(dtype=x.dtype), sin.to(dtype=x.dtype)
```
3. 交错MRoPE的实现跟Qwen3-VL类似，区别在于从[16, 24, 24]修改成[11, 11, 10]（对应MRoPE 逆频率D=[dim//2]=32）。代码中以 T 维度为基础，遍历 H 和 W 维度。
    - offset=1 对应 H 维度在交错序列中的位置，idx 为$$ [1, 4, 7, 10, ...]$$, 替换掉T维度中对应位置的值
    - offset=2 对应 W 维度在交错序列中的位置，idx 为 $$[2, 5, 8, 11, ...]$$, 替换掉T维度中对应位置的值
``` python
def apply_interleaved_mrope(self, freqs, mrope_section):
    """Apply interleaved MRoPE to 3D rotary embeddings.
    Reorganizes frequency layout from chunked [TTT...HHH...WWW] to
    interleaved [THWTHWTHW...TT], preserving frequency continuity.
    args:
        x: (3, bs, seq_len, head_dim // 2)
        mrope_section: (3,)
    returns:
        x_t: (bs, seq_len, head_dim // 2)
    """
    freqs_t = freqs[0]  # just overwrite the first dimension T
    for dim, offset in enumerate((1, 2), start=1):  # H, W
        length = mrope_section[dim] * 3
        idx = slice(offset, length, 3)
        freqs_t[..., idx] = freqs[dim, ..., idx]
    return freqs_t
```
4. 最后将计算好的 cos 和 sin 注入到 Attention 的 Query 和 Key 中，完成位置信息的融合。
``` python
# 将输入向量的后半部分取负号并与前半部分交换位置，相当于对向量应用了90度的旋转操作。
def rotate_half(x):
    # 对于向量 x = [x1, x2]，其中 x1 是前半部分，x2 是后半部分
    # 旋转操作：rotate_half(x) = [-x2, x1]
    x1 = x[..., : x.shape[-1] // 2]  
    x2 = x[..., x.shape[-1] // 2 :]  
    return torch.cat((-x2, x1), dim=-1)
def apply_rotary_pos_emb(q, k, cos, sin, unsqueeze_dim=1):
    cos = cos.unsqueeze(unsqueeze_dim)
    sin = sin.unsqueeze(unsqueeze_dim)
    # 只对前1/4的维度进行旋转q_rot
    rotary_dim = cos.shape[-1]
    q_rot, q_pass = q[..., :rotary_dim], q[..., rotary_dim:]
    k_rot, k_pass = k[..., :rotary_dim], k[..., rotary_dim:]

    #将位置信息编码到query和key中，等价于应用旋转矩阵：
    # [cos(θ)  -sin(θ)]  [x1]   [cos(θ)*x1 - sin(θ)*x2]
    #                         = 
    #[sin(θ)   cos(θ)]  [x2]   [sin(θ)*x1 + cos(θ)*x2]
    q_embed = (q_rot * cos) + (rotate_half(q_rot) * sin)
    k_embed = (k_rot * cos) + (rotate_half(k_rot) * sin)

    # 拼接不旋转的部分
    q_embed = torch.cat([q_embed, q_pass], dim=-1)
    k_embed = torch.cat([k_embed, k_pass], dim=-1)
    return q_embed, k_embed
```
### LLM
Qwen3.5采用交错的线性注意力和全注意力组合，具体比例为3:1。
#### 线性注意力
Qwen3_5GatedDeltaNet类实现了线性注意力，基于 Delta Rule + 门控机制，实现线性复杂度的长序列注意力计算。

- 传统注意力的问题：每个 token 需要与所有历史 token 计算注意力分数。
- Gated DeltaNet 的解决方案：使用状态空间模型（SSM）的思想，通过递归状态更新和门控机制实现线性复杂度。换句话说，维护一个压缩的状态表示，而不是存储所有历史信息。这种方式既保持了$$O(1)$$的推理速度，也保留了传统注意力计算的训练并行特点。递推公式为：
$$h_t = h_{t-1} * exp(g_t) + (v_t - k_t^T h_{t-1}) * \beta_t \\
output_t = q_t^T h_t$$
其中g是衰减门控，beta是更新步长。
1. 初始化方法中关注几个变量：
    - num_v_heads = 32， num_k_heads = 16，这里通过 repeat_interleave 将 key 头映射到到更多 value 头。
    - conv_dim = head_k_dim * num_k_heads*2 + head_v_dim * num_v_heads：QKV总维度，Q、K、V 共享同一个卷积核，减少参数量，提高计算效率
    - 因果分组卷积层
        - 分组卷积（groups=conv_dim）：每个QKV维度独立卷积。
        - 因果填充（padding=conv_kernel_size-1）：保证卷积仅依赖历史信息，不泄露未来token。
        - 作用：捕捉局部序列依赖，补充DeltaNet的全局建模能力。
    - SSM的可学习参数
        - dt_bias：时间步投影的偏置，用于计算衰减门控 g
        - A_log：SSM 的状态矩阵，控制状态衰减速度，对数形式避免负数值，最终通过exp()转为衰减系数A
    - Qwen3_5RMSNormGated：使用 z 作为门控信号，output = RMSNorm(attention) * SiLU(z)。
2. 前向传播
    1. 输入处理和缓存检查
        - 训练/预填充：use_precomputed_states = False，使用 chunk_gated_delta_rule
        - 推理/增量解码：use_precomputed_states = True，使用 recurrent_gated_delta_rule
    2. 输入投影
    3. 利用因果分组卷积层，捕捉局部特征
        - 训练/预填充：对整个序列进行并行卷积
        - 推理：只处理新 token，使用缓存的 conv_state，仅更新当前token的卷积结果（时间复杂度O(1)）
    4. 恢复QKV的形状，确保 Q、K、V 之前经过相同的特征提取
    5. 门控参数计算：
    6. Delta Rule注意力计算（线性复杂度核心）
        - 训练/预填充：分块(块大小64)计算长序列注意力，块内并行计算，块之间通过递归状态传递，使用衰减掩码处理块内的位置关系。核心代码：
        - 推理/增量解码：递归计算，复用历史递归状态，仅计算当前token，时间复杂度$$O(1)$$。核心代码：
    7. 门控归一化，输出投影

#### 全注意力
Qwen3_5Attention 是全注意力类，使用了带门控的多头注意力。做了以下改进：
- 门控机制：q_proj 的输出被分成两部分：Query 和 Gate，Gate用于在注意力输出后应用查询依赖的门控，增强模型表达能力
- RMSNorm 归一化：对 Query 和 Key 分别做Zero-Centered RMSNorm 归一化，提升训练稳定性
- KV Cache：适配KV cache的增量推理

1. 初始化方法中关注以下变量：
    - q_proj: Query 投影层，输出维度为 num_attention_heads * head_dim * 2，因为同时生成 Query 和 Gate
    - q_norm 和 k_norm：对QK添加 Zero-Centered RMSNorm，相比于传统的RMSNorm 添加了减去均值操作。
2. forward函数：
    1. Query 和 Gate 的分离：
    2. 对QK应用 Zero-Centered RMSNorm
    3. 应用MRoPE、增量推理、计算注意力。最后使用 sigmoid 门控对注意力输出进行控制，防止attention sink。
### ViT
舍弃了Qwen3-VL中的Deepstack架构，还是采用NaViT架构
### Merger
沿用了Qwen-VL系列采用的PatchMerger结构，采用一个两层的MLP层，将相邻的2x2的patch合并。
## Qwen3.5MoE核心代码解读
在了解了Qwen3.5的核心代码后，接下来关注MoE版本模型的改动点。主要差异是将MLP替换为MoE架构Qwen3_5MoeSparseMoeBlock，主要包含TopKRouter、experts和shared_expert，最终输出为路由专家输出 + 共享专家输出。

- TopKRouter：Qwen3_5MoeTopKRouter
    - 计算每个 token 对所有专家的得分（logits）
    - 使用 softmax 归一化
    - Top-K 选择：每个 token 只激活 top_k 个专家
    - 归一化权重：确保选中的专家权重和为 1
- experts：Qwen3_5MoeExperts
    - 参数以 3D 张量存储：(num_experts, intermediate_dim, hidden_dim)
    - 稀疏激活：只计算被选中的专家
    - 加权聚合：按路由权重加权求和
- shared_expert：Qwen3_5MoeMLP
    - 共享专家对所有 token 都处理
    - 通过门控（sigmoid）控制共享专家的贡献