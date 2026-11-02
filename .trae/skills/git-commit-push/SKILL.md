---
name: git-commit-push
description: 将当前项目提交到 GitHub。当用户要求 commit、push、提交代码、上传到 GitHub 时使用。不适用于其他代码托管平台或仅本地提交的场景。
---

# Git 提交推送

将当前工作区的改动提交并推送到 GitHub 远程仓库。

## 流程

1. 检查当前目录是否为 git 仓库，若非则执行 `git init`。
2. 检查 `git config user.name` 与 `user.email`，未设置则配置（优先使用用户提供的身份）。
3. 检查远程仓库 `origin`，未设置则添加 SSH 地址 `git@github.com:<用户>/<仓库>.git`。
4. 执行 `git add -A` 暂存所有改动。
5. 执行 `git commit -m "<提交说明>"`，若用户未指定说明，使用 `update: 同步项目文件`。
6. 执行 `git push -u origin <分支>`，首次推送使用 `-u`，分支默认 `main`。

## 注意

- 使用 SSH 协议推送，依赖已配置的 SSH 公钥。
- 提交前确认工作区文件状态，避免提交敏感信息（密钥、token 等）。
- 若远程已存在历史且与本地无共同祖先，提示用户决定是否使用 `--allow-unrelated-histories`。
