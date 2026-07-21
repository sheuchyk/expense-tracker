#!/usr/bin/env bash
# PostToolUse hook: запускает `eslint --fix` на изменённом файле.
# Выполняется после Prettier-хука (см. .claude/settings.json).
#
# Читает JSON события из stdin, берёт путь файла, и если это JS/TS-файл —
# поднимается вверх по дереву до ближайшего eslint.config.* (workspace
# frontend/ или backend/), заходит туда и прогоняет автофиксы.
# Никогда не блокирует: любые ошибки проглатываются, exit 0.
set -uo pipefail

f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)
[ -z "$f" ] && exit 0

# ESLint настроен только на JS/TS-файлы
case "$f" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs) ;;
  *) exit 0 ;;
esac

# Ищем ближайший flat-config вверх по дереву (workspace-корень)
dir=$(dirname "$f")
while [ "$dir" != "/" ] && [ "$dir" != "." ]; do
  if [ -f "$dir/eslint.config.mjs" ] || [ -f "$dir/eslint.config.js" ] || [ -f "$dir/eslint.config.cjs" ]; then
    break
  fi
  dir=$(dirname "$dir")
done

# Конфиг не найден — файл вне линтуемого workspace, выходим тихо
{ [ "$dir" = "/" ] || [ "$dir" = "." ]; } && exit 0

cd "$dir" && npx eslint --fix "$f" >/dev/null 2>&1
exit 0
