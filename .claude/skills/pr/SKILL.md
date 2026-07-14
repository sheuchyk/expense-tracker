---
name: pr
description: Создать Pull Request на GitHub с указанным названием и целевой веткой. Использует gh CLI и соглашения проекта expense-tracker.
argument-hint: "<название PR> [base-ветка]"
model: sonnet
effort: low
user_invocable: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git push:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh repo view:*), Bash(bash:*), Read
---

# PR Skill

Создай Pull Request на GitHub для текущей ветки.

## Аргументы

Запрос пользователя: `$ARGUMENTS`

Из него извлеки (порядок произвольный, всё опционально):

- **Название PR** — заголовок Pull Request (на русском языке, по правилам ниже).
- **Целевая ветка** (base) — ветка, в которую вливается текущая. По умолчанию `master`.

Если название не передано — сгенерируй его сам на основе коммитов и диффа. Если base не передана — используй `master`.

## Подготовка

Выполни следующие шаги через Bash (base — аргумент `$2` или `master` по умолчанию):

1. Проверь, что ветка готова к PR:
   ```bash
   bash "$CLAUDE_SKILL_DIR/scripts/validate.sh"
   ```
   Если скрипт вернул ошибку — остановись и сообщи пользователю причину.
2. Получи diff от базовой ветки:
   ```bash
   git diff <base>..HEAD
   ```
3. Получи список коммитов:
   ```bash
   git log <base>..HEAD --oneline
   ```

## Задача

Используя данные выше — заполни шаблон из @template.md.
Посмотри пример хорошего PR: @examples/good-pr.md

## Создание PR

Создай PR командой `gh pr create` (тело — через HEREDOC):

```bash
gh pr create \
  --title "<название PR или сгенерированный title>" \
  --body "$(cat <<'EOF'
<заполненный шаблон>
EOF
)" \
  --base <base>
```

После создания верни пользователю URL из вывода `gh pr create`.

## Правила

- Заголовок по Conventional Commits: `type(scope): описание` — на русском, с маленькой буквы, без точки в конце.
- Если ветка не запушена на remote:
  ```bash
  git push --set-upstream origin HEAD
  ```
- **Не создавай** PR из `master` / `main`.
- Если PR для текущей ветки уже существует — сообщи об этом (`gh pr view`) и не создавай дубликат.
