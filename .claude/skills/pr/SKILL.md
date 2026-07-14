---
name: pr
description: Создать Pull Request на GitHub с указанным названием и целевой веткой. Использует gh CLI и соглашения проекта expense-tracker.
argument-hint: "<название PR> [base-ветка]"
model: sonnet
effort: low
user_invocable: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git push:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh repo view:*), Read
---

# PR Skill

Создай Pull Request на GitHub для текущей ветки.

## Аргументы

Скилл принимает два аргумента (в произвольном порядке в тексте запроса пользователя):

1. $0 **Название PR** — заголовок Pull Request (на русском языке, по правилам ниже).
2. $1 **Целевая ветка** (base) — ветка, в которую вливается текущая. По умолчанию `master`.

Если пользователь передал только один аргумент — считай его названием PR, а base определи по умолчанию.

## Подготовка

1. Проверка что ветка готова:
   !`bash "$CLAUDE_SKILL_DIR/scripts/validate.sh"`
2. Получи diff от базовой ветки:
   !`git diff ${ARGUMENTS:-master}..HEAD`
3. Получи список коммитов:
   !`git log ${ARGUMENTS:-master}..HEAD --offline`

## Задача

Используя данные выше — заполни шаблон
из @template.md.
Посмотри пример хорошего PR: @examples/good-pr.md

## Создание PR

Создай PR командой:
gh pr create \
 --title "$0 или сгенерированный title" \
   --body "заполненный шаблон" \
   --base "${ARGUMENTS:-main}"

## Правила

- Заголовок по conventional commits
- Если ветка не запушена:
  git push --set-upstream origin HEAD
