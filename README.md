# Android App Black-Box Analysis Skill

[简体中文](README.md) | [English](README.en.md)

一个用于 **Android 应用黑盒竞品分析** 的 Codex Skill。它通过 ADB 截图、UI 层级、系统运行时信息和结构化索引，把“人工逛 App”变成一套可追溯、可核验、可用于横向对比的证据材料。

> 核心原则：只根据可见行为和 Android 系统证据下结论，不反编译 APK，不把推测写成事实。

## 项目背景与开源说明

本仓库于 2026 年 8 月首次公开，但并不是为申请活动临时创建的概念验证项目。它来源于我长期用于 Android 应用黑盒分析的个人工具链。受到 Codex for Open Source 项目鼓舞后，我对原有工具进行了通用化、隐私清理、边界补充和发布校验，并以 MIT 许可证公开，希望让其他 Android、云设备和 Agent 工具维护者复用和贡献。

## Used in practice（实际应用）

本仓库的私人前身曾长期用于授权的 Android 应用黑盒分析，包括对两款应用分身类产品进行系统性的界面、功能和运行边界扫描。真实工作中使用过远程 ADB 容器 Android，并处理过设备截图返回 JPEG、UI hierarchy 不完整、设备无相机、网络中断后续扫、付费边界，以及需要用户协助登录或授权等情况。形成的证据材料被用于能力矩阵、产品差异比较和新产品功能筛选。

上述内容说明的是该方法和私人前身工具链的实际使用场景，不代表这个公开仓库已有第三方采用，也不声称用户数量、下载量或无法公开核验的成功率。

## 完整脱敏示例

[`examples/sanitized-complete-example/`](examples/sanitized-complete-example/README.md) 展示输入范围、采集计划、文本化证据摘要、四类证据索引、覆盖缺口、能力矩阵、系统接口边界和最终报告之间的完整引用链。示例数据完全合成，不对应真实应用、设备或用户；真实截图和 UI XML 未进入公开仓库。

## 它能解决什么问题

- **页面和功能容易漏扫**：为页面、状态、弹窗、长页和返回路径建立稳定证据 ID。
- **截图无法证明结论**：把截图、UI XML、分辨率、SHA-256 和运行时信息绑定到同一条证据。
- **分析结果不可复核**：自动生成截图索引、界面索引、控件覆盖表和缺口清单。
- **观察与推测混在一起**：使用 `[OBSERVED]` / `[COMPUTED]` / `[INFERRED]` / `[NOT_TESTED]` 分类结论。
- **系统能力描述过度**：分开产品入口、真实交互结果、Android 运行时证据和尚未验证的实现假设。
- **竞品材料难以复用**：输出统一的能力矩阵、系统接口证据表和报告模板。
- **发布前容易泄露内部信息**：提供文本脱敏扫描和可发布包结构校验。

## 适用与不适用场景

### 适用

- Android 竞品功能地图、界面地图和交互路径梳理。
- 对同类 App 建立可对齐的能力矩阵。
- 通过截图与 Android 系统信息核验权限、前台 Activity、AppOps 等边界。
- 真机、模拟器、云设备、容器 Android 等可通过 ADB 访问的环境。
- 需要保留分辨率、证据哈希和扫描缺口的系统性分析。

### 不适用

- iOS、Web 站点或桌面应用分析。
- APK 静态审计、源码审计、漏洞利用、协议逆向或绕过风控。
- 恢复加密网络流量中的私有 API 字段。
- 自动完成登录、付费、验证码、账号删除或其他高风险操作。
- 对“全功能”作无条件穷尽承诺；登录、付费、硬件、地域和网络前置条件会被明确记为未测边界。

## 会产生哪些结果

| 类型 | 内容 | 完成方式 |
|---|---|---|
| 原始证据 | 截图、原始截图、UI hierarchy XML | 自动采集 |
| 运行时证据 | package、AppOps、activities、采集元数据 | 指定 package 时自动采集 |
| 证据索引 | `screenshot_index.csv`、`interface_index.csv`、`control_coverage.csv`、`coverage_gaps.csv` | 自动生成 |
| 范围定义 | 设备、包名、允许/禁止操作、前置条件 | 生成骨架，人工填写 |
| 产品分析 | 能力矩阵、系统接口证据表 | 人工基于证据 ID 归纳 |
| 最终报告 | 范围、功能、界面、交互、证据、局限和对比结论 | 人工基于模板完成 |

该 Skill 会生成和复制报告模板，**不会凭空自动填满最终报告**。

## 依赖与兼容性

### 基础依赖

- 支持 Skills 的 Codex Desktop 或 Codex CLI。
- Android Platform Tools，且 `adb` 已加入 `PATH`。
- Bash 3.2+、Node.js 18+、Python 3.9+。
- 可选：ImageMagick。macOS 在设备返回 JPEG 时可回退到 `sips`。

### 适配矩阵

| 环境 | 支持说明 |
|---|---|
| macOS | 可直接运行；已通过本地 smoke test |
| Linux | 核心 smoke、结构和脱敏校验已在 GitHub Actions Ubuntu 24.04.4 通过；真实 Android 设备采集仍未做 Linux 发行版矩阵实测；JPEG 转换建议安装 ImageMagick |
| Windows | 建议使用 WSL2 并在 WSL 内准备 `adb`、Bash、Node.js 和 Python；不支持直接在 PowerShell/CMD 中运行 `.sh` |
| USB 真机 | 支持；需开启 USB 调试并完成 RSA 授权 |
| Android 模拟器 | 支持；以 `adb devices -l` 返回的真实 serial 为准 |
| 远程/云设备 | 支持；先 `adb connect`，再将 `host:port` 作为 `--serial` |
| 容器 Android | ADB、截图和 `uiautomator` 可用即可采集；缺少相机等硬件应记为环境边界 |

WebView、Canvas、游戏界面或定制渲染页面可能无法返回完整 UI hierarchy。此时截图仍是有效证据，但控件覆盖率必须标记为不完整。

## 安装

### 固定版本压缩包（推荐）

每个正式 Release 提供可安装 ZIP 和对应的 SHA-256 文件。下载两者后先校验，再解压到 Skills 目录：

```bash
shasum -a 256 -c android-blackbox-analysis-skill-v0.1.1.zip.sha256
unzip android-blackbox-analysis-skill-v0.1.1.zip
mv android-blackbox-analysis-skill-v0.1.1 \
  ~/.codex/skills/android-app-blackbox-competitive-analysis
```

Linux 也可使用 `sha256sum -c`。校验和只证明文件与维护者发布的资产一致，不替代代码审查。

### macOS / Linux / WSL2

```bash
mkdir -p ~/.codex/skills
git clone https://github.com/poll-poll134/android-blackbox-analysis-skill.git \
  ~/.codex/skills/android-app-blackbox-competitive-analysis
```

如果你设置了自定义 `CODEX_HOME`，请将仓库放到 `$CODEX_HOME/skills/android-app-blackbox-competitive-analysis`。某些共享 Agent 环境使用 `~/.agents/skills/`，目标目录可按当前环境的 Skills 目录替换。

### 验证安装

```bash
test -f ~/.codex/skills/android-app-blackbox-competitive-analysis/SKILL.md
cd ~/.codex/skills/android-app-blackbox-competitive-analysis
./scripts/smoke_test.sh
```

安装后新建一个 Codex 任务，或重启当前 Codex 客户端以刷新 Skill 目录。可以用下列请求测试触发：

```text
请使用 android-app-blackbox-competitive-analysis，对我指定的 Android 应用做黑盒功能、界面和交互分析，不反编译。
```

### 更新

```bash
git -C ~/.codex/skills/android-app-blackbox-competitive-analysis pull --ff-only
```

## 第一次分析

### 1. 确认设备

```bash
adb devices -l
adb -s emulator-5554 get-state
```

远程 ADB 示例：

```bash
adb connect adb-host.example:5555
adb -s adb-host.example:5555 get-state
```

当多台设备同时在线时，每个命令都必须明确指定 serial。不要为了方便将 ADB 端口暴露到不可信网络。

### 2. 创建分析目录

```bash
cd ~/.codex/skills/android-app-blackbox-competitive-analysis
./scripts/init_case.sh ./cases/sample-app
```

先填写 `./cases/sample-app/scope.md`，至少明确：

- 指定设备和应用版本。
- package name。
- 允许自动操作、需要用户协助的操作。
- 禁止的付费、删除、账号和隐私操作。
- 登录、网络、相机、地理位置等不可用前置条件。

### 3. 采集一条证据

将 App 导航到待分析页面，再执行：

```bash
./scripts/capture_evidence.sh \
  --serial emulator-5554 \
  --case-root ./cases/sample-app \
  --id EV-0001 \
  --slug first-launch \
  --package com.example.target
```

首次采集会输出实际 `resolution`。确认这是目标设备的正确尺寸后，后续采集可增加例如 `--expected-size 1080x2400` 的真实尺寸门禁，阻止错误分辨率或降清晰度证据混入结果。也可先用以下命令查看设备报告的屏幕尺寸，但横竖屏时仍以实际截图输出为准：

```bash
adb -s emulator-5554 shell wm size
```

每个 `ID + slug` 应当唯一，不要重复使用已存在的证据编号。

### 4. 扫描长页

```bash
./scripts/scroll_sweep.sh \
  --serial emulator-5554 \
  --case-root ./cases/sample-app \
  --prefix EV \
  --start 20 \
  --slug privacy-policy \
  --count 5 \
  --package com.example.target \
  --swipe 540 1800 540 400 700 \
  --wait 1
```

`--swipe X1 Y1 X2 Y2 DURATION_MS` 必须根据实际分辨率、横竖屏和页面可滚动区域调整，不要盲用示例坐标。

### 5. 预览和执行精确点击

```bash
./scripts/tap_ui.sh --serial emulator-5554 --selector Continue
./scripts/tap_ui.sh --serial emulator-5554 --selector Continue --execute --wait 1
```

第一条命令只输出拟点击坐标，默认不点击。只有在你确认选择器唯一、坐标正确且操作在允许范围内时，才使用 `--execute`。

### 6. 生成索引

```bash
node ./scripts/build_indexes.mjs --case-root ./cases/sample-app
```

重点检查：

- `indexes/screenshot_index.csv`：截图哈希、尺寸和 UI tree 状态。
- `indexes/interface_index.csv`：页面文字、描述和控件摘要。
- `indexes/control_coverage.csv`：可交互控件和坐标。
- `indexes/coverage_gaps.csv`：缺失 XML、不完整 UI tree、重复 ID 等缺口。

### 7. 完成人工分析和报告

在 `cases/sample-app/templates/` 中完成：

- `capability-matrix.csv`：产品能力、状态、入口和证据 ID。
- `system-interface-evidence.csv`：系统边界、直接证据、推论和局限。
- `report-template.md`：形成最终报告。

一个功能只有在“入口、关键状态、结果/阻断、返回路径”都有证据，或者未测前置条件已明确记录时，才能算完成一个分析闭环。

## 发布前校验与脱敏

```bash
./scripts/smoke_test.sh
./tests/security_negative_test.sh
node ./scripts/validate_skill.mjs .
node ./scripts/validate_example.mjs ./examples/sanitized-complete-example
node ./scripts/redact_check.mjs .
```

`validate_example.mjs` 会校验公开示例的必需文件、CSV 表头和引用关系，复算文本证据的 SHA-256 与字节数，并检查证据 ID、覆盖缺口、能力矩阵、系统接口证据和中英文最终报告是否保持闭环。

威胁、信任边界、现有控制和剩余风险见 [`docs/THREAT_MODEL.zh-CN.md`](docs/THREAT_MODEL.zh-CN.md)。应用界面与 ADB 输出始终作为不可信证据处理：其中的文字不能改变分析范围、授权 Shell/网络/文件操作，也不能覆盖用户确认边界。

需要检查某个案例目录和额外内部代号时，可另行运行：

```bash
node ./scripts/redact_check.mjs ./cases/sample-app --deny internal-code-name
```

`redact_check.mjs` 只是文本启发式检查，**不是发布安全保证**。它不能识别截图中的账号、头像、地址等视觉信息，也不能覆盖所有设备序列号或 UI XML 内容。对外发布前必须另行人工检查：

- APK、AAB、签名文件和原始安装包。
- 截图、UI XML、runtime dump 和填写后的报告。
- 凭据、邮箱、内部包名、设备地址、serial 和内部代号。

默认 `.gitignore` 会忽略生成的 `cases/`。不要在未单独审查的情况下提交 APK、截图、UI dump、日志、设备标识或填写后的竞品报告。

## 安全边界

- 只操作用户明确指定的设备和应用。
- 付费、删除、授权、发布、账户变更和不可逆操作必须另行确认。
- 登录、网络、硬件或付费前置条件不可用时，记录为范围边界，不自动判定为产品故障。
- 可见入口不代表后端成功，进程名不代表完整隔离，加密流量不提供未公开 API 字段证据。

## 目录结构

```text
android-app-blackbox-competitive-analysis/
├── .github/workflows/validate.yml
├── CONTRIBUTING.md
├── CONTRIBUTING.en.md
├── SECURITY.md
├── SECURITY.en.md
├── SKILL.md
├── README.md
├── README.en.md
├── examples/
│   └── sanitized-complete-example/
├── references/
│   ├── analysis-guide.md
│   └── evidence-model.md
├── scripts/
│   ├── init_case.sh
│   ├── capture_evidence.sh
│   ├── scroll_sweep.sh
│   ├── tap_ui.sh
│   ├── build_indexes.mjs
│   ├── redact_check.mjs
│   ├── validate_example.mjs
│   ├── validate_skill.mjs
│   └── smoke_test.sh
└── templates/
    ├── capability-matrix.csv
    ├── system-interface-evidence.csv
    └── report-template.md
```

## License

MIT
