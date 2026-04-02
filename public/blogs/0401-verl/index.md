不魔改代码一般从docker拉取，如果需要自定义环境或者修改verl源码，我们就从源码安装。

### 1 创建Conda环境
``` bash
conda create -n verl python==3.12
conda activate verl
```

### 2 安装依赖
``` bash
# 克隆仓库
git clone https://github.com/volcengine/verl.git
cd verl

# 安装全部依赖（包含 Megatron-LM）
bash scripts/install_vllm_sglang_mcore.sh

# 或仅安装 FSDP 依赖（更快）
USE_MEGATRON=0 bash scripts/install_vllm_sglang_mcore.sh
```
不使用qwen3.5的话直接跳到第3节就行。

这里我们对安装脚本进行详细解读一下，主要的原因是：我所训练的模型是Qwen3.5,而支持这个模型就需要transformers的版本在5以上，而我们通过脚本安装的版本不对，vllm版本也过低。

当我们升级vllm版本后，会发现pytorch也要升级，进而需要重新编译flash-attention。总之整个依赖报错的原因是：
模型新 -> 新版transformers库 -> 新版vllm库 -> 新版pytorch库 -> 没有对应的编译好的flash-attn -> 自己手动编译

我们打开scripts/install_vllm_sglang_mcore.sh，按照顺序去解读。
#### 2.1 推理引擎
``` bash
#!/bin/bash

USE_MEGATRON=${USE_MEGATRON:-1}
USE_SGLANG=${USE_SGLANG:-1}

export MAX_JOBS=32

echo "1. install inference frameworks and pytorch they need"
if [ $USE_SGLANG -eq 1 ]; then
    pip install "sglang[all]==0.5.2" --no-cache-dir && pip install torch-memory-saver --no-cache-dir
fi
pip install --no-cache-dir "vllm==0.17.1"

```
MAX_JOBS=32是为了加速编译，一般设置为自己电脑的cpu核心数或者一半。
然后会安装两个推理引擎，sglang、vllm以及他们所对应的pytorch版本，因为在我们项目中，vllm需要升级到0.17.1,对应的pytorch版本是2.10.0,而sglang0.5.2默认对应的是2.8.0，所以我们把安装vllm的脚本放后面，防止torch被覆盖。

#### 2.2 基本包
``` bash
echo "2. install basic packages"
pip install "transformers[hf_xet]>=4.51.0" accelerate datasets peft hf-transfer \
    "numpy<2.0.0" "pyarrow>=15.0.0" pandas "tensordict>=0.8.0,<=0.10.0,!=0.9.0" torchdata \
    ray[default] codetiming hydra-core pylatexenc qwen-vl-utils wandb dill pybind11 liger-kernel mathruler \
    pytest py-spy pre-commit ruff tensorboard 

echo "pyext is lack of maintainace and cannot work with python 3.12."
echo "if you need it for prime code rewarding, please install using patched fork:"
echo "pip install git+https://github.com/ShaohonChen/PyExt.git@py311support"

pip install "nvidia-ml-py>=12.560.30" "fastapi[standard]>=0.115.0" "optree>=0.13.0" "pydantic>=2.9" "grpcio>=1.62.1"
```
这里就是一些基本包，直接运行也不会有错误。

#### 2.3 编译flash-attention
``` bash
echo "3. install FlashAttention and FlashInfer"
# Install flash-attn-2.8.1 (cxx11abi=False)
wget -nv https://github.com/Dao-AILab/flash-attention/releases/download/v2.8.1/flash_attn-2.8.1+cu12torch2.8cxx11abiFALSE-cp312-cp312-linux_x86_64.whl && \
    pip install --no-cache-dir flash_attn-2.8.1+cu12torch2.8cxx11abiFALSE-cp312-cp312-linux_x86_64.whl

pip install --no-cache-dir flashinfer-python==0.3.1
```
这是原始的脚本，可以看到，因为官方默认torch是2.8.0,所以直接使用了别人编译好的2.8版本的flash-attn。

但是前面提到，我们更新了vllm版本，而目前还没有发布对应torch2.10.0的flash-attn，所以我们需要自己编译。而我在自己编译的时候遇到一些问题，那么总结下来是这样的：
1. 如果直接`pip install flash-attn`，会产生缺少torch的报错，但我们明明已经安装了torch，这是flash-attn的编译自动开启沙盒环境，没有用我们的环境，所以我们要阻止他开启，`pip install flash-attn --no-build-isolation`。
2. 第二次发现编译到一半突然被kill了，原因是MAX_JOBS设置的太大了，导致内存不足，所以设置`MAX_JOBS=8`。
3. 第三次发现编译十分缓慢，原因是编译了所有架构，但我们的gpu只要80的架构就可以，不必编译90等，所以设置`FLASH_ATTN_CUDA_ARCHS="80"`。
4. 设置完之后，重新启动第2步，即可编译成功。

#### 2.4 安装TransformerEngine和Megatron-LM
``` bash
if [ $USE_MEGATRON -eq 1 ]; then
    echo "4. install TransformerEngine and Megatron"
    echo "Notice that TransformerEngine installation can take very long time, please be patient"
    pip install "onnxscript==0.3.1"
    NVTE_FRAMEWORK=pytorch pip3 install --no-deps git+https://github.com/NVIDIA/TransformerEngine.git@v2.6
    pip3 install --no-deps git+https://github.com/NVIDIA/Megatron-LM.git@core_v0.13.1
fi
```
这里因为要从git下载东西，会占用很大的内存，所以一定要注意系统盘的内存，如果不够，就设置`export TMPDIR=/root/autodl-tmp`，把临时文件放到其他盘。

#### 2.5 安装其他依赖
``` bash
echo "5. May need to fix opencv"
pip install opencv-python
pip install opencv-fixer && \
    python -c "from opencv_fixer import AutoFix; AutoFix()"


if [ $USE_MEGATRON -eq 1 ]; then
    echo "6. Install cudnn python package (avoid being overridden)"
    pip install nvidia-cudnn-cu12==9.10.2.21
fi

echo "Successfully installed all packages"
```
基本不会报错，正常运行即可。

到这里其实已经结束了，但是由于我们的项目需要用到Qwen3.5模型，而这个模型需要transformers的版本在5以上，所以在这里手动安装一下。即时警告与vllm冲突也不用管。

### 3 安装verl
``` bash
pip install --no-deps -e .
```