# 贡献指南

[简体中文](CONTRIBUTING.md) | [English](CONTRIBUTING.en.md)

感谢你帮助改进 Android App Black-Box Analysis Skill。本项目欢迎针对兼容性、证据采集、索引生成、校验脚本、文档和测试的聚焦贡献。

安全漏洞请按照 [SECURITY.md](SECURITY.md) 私下报告，不要创建包含漏洞细节的公开 Issue。

## 开始之前

- 先搜索现有 Issue，避免重复工作。
- 对较大的行为变更，先创建 Issue 说明问题、使用场景和建议边界。
- 保持黑盒分析原则：不要提交反编译结果、绕过机制或未经证据支持的实现断言。
- 不要提交 APK、截图、UI XML、日志、账号数据、设备标识、凭据、内部包名或公司内部材料。

## 本地开发

依赖 Bash 3.2+、Node.js 18+ 和 Python 3.9+。克隆仓库后运行：

```bash
./scripts/smoke_test.sh
node ./scripts/validate_skill.mjs .
node ./scripts/redact_check.mjs .
```

这三个命令必须全部成功。它们不需要连接 Android 设备；涉及真实设备的改动还应在你有权操作的测试设备上单独验证，并在 Pull Request 中说明已验证和未验证的环境。

## 修改要求

- 一个 Pull Request 聚焦一个明确问题，避免无关重构。
- 保留默认只读或预览行为；新增有副作用的操作必须有显式执行开关和清晰边界。
- 新增输出应能追溯到证据 ID，并区分观察、计算、推论和未测试内容。
- 行为变化需要相应测试或可复现的验证步骤。
- 新增文档应同步维护中英文版本，代码块、路径和安全限制必须一致。
- 提交前运行 `git diff --check`，并人工检查文本和二进制材料是否完成脱敏。

## 提交 Pull Request

Pull Request 请说明：

- 解决的问题和变更范围；
- 用户可见行为是否变化；
- 执行过的校验命令及结果；
- 已测试的平台和仍未测试的边界；
- 相关 Issue（如有）。

维护者可能要求缩小范围、补充证据、测试或脱敏。所有贡献在合并后按本仓库的 [MIT License](LICENSE) 发布。

