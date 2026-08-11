# 完整脱敏示例

[简体中文](README.md) | [English](README.en.md)

这个目录展示一次 Android 应用黑盒分析从输入到报告的完整公开链路。示例中的应用、页面、版本、设备标识和所有观察结果均为合成数据，不对应任何真实产品或用户。

为了示范安全发布，真实截图和 UI XML 被可审查的文本化页面摘要替代。`screenshot_index.csv` 保留原索引表头，并将格式明确标为 `TEXT-SUMMARY`、UI 树状态标为 `omitted`；这些摘要的 SHA-256 和字节数仍可复算。该处理用于公开示例，不代表日常分析时可以省略原始截图或 UI XML。

## 目录与分析链

```text
input/scope.md
input/capture-plan.csv
        │
        ▼
evidence/screen-summaries/*.md
        │
        ▼
indexes/screenshot_index.csv
indexes/interface_index.csv
indexes/control_coverage.csv
indexes/coverage_gaps.csv
        │
        ▼
analysis/capability-matrix.csv
analysis/system-interface-evidence.csv
        │
        ▼
reports/final-report.md
```

## 如何阅读

1. 从 [`input/scope.md`](input/scope.md) 查看设备、允许操作和明确排除项。
2. 用 [`input/capture-plan.csv`](input/capture-plan.csv) 对照计划与实际状态。
3. 通过 `DEMO-0001` 至 `DEMO-0005` 在页面摘要、四类索引和报告之间追踪同一证据。
4. 在 [`indexes/coverage_gaps.csv`](indexes/coverage_gaps.csv) 查看原始材料省略、UI 树不完整和未测试前置条件。
5. 最终报告只把索引支持的内容写为观察或计算结论，其余内容明确标为推论或未测试。

复算公开摘要哈希：

```bash
shasum -a 256 examples/sanitized-complete-example/evidence/screen-summaries/*.md
```

从仓库根目录校验整条示例引用链：

```bash
node ./scripts/validate_example.mjs ./examples/sanitized-complete-example
```
