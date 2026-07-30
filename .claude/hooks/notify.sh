#!/bin/bash

# Универсальный скрипт нотификаций для macOS и Linux.
# Сообщение можно передать первым аргументом; иначе берётся значение по умолчанию.
# Claude Code передаёт в hook JSON через stdin — при наличии поля .message оно
# используется как текст уведомления.

MESSAGE="$1"

# Если аргумент не передан, пробуем прочитать .message из JSON события на stdin.
if [ -z "$MESSAGE" ] && [ ! -t 0 ]; then
  STDIN_JSON="$(cat)"
  if command -v jq >/dev/null 2>&1; then
    MESSAGE="$(printf '%s' "$STDIN_JSON" | jq -r '.message // empty' 2>/dev/null)"
  fi
fi

# Значение по умолчанию.
MESSAGE="${MESSAGE:-Claude ждёт вашего ввода}"
TITLE="Claude Code"

case "$(uname -s)" in
  Darwin)
    # macOS
    osascript -e "display notification \"${MESSAGE//\"/\\\"}\" with title \"$TITLE\"" >/dev/null 2>&1
    ;;
  Linux)
    # Linux
    if command -v notify-send >/dev/null 2>&1; then
      notify-send "$TITLE" "$MESSAGE"
    else
      # Фолбэк, если notify-send недоступен.
      printf '\a%s: %s\n' "$TITLE" "$MESSAGE" >&2
    fi
    ;;
  *)
    printf '%s: %s\n' "$TITLE" "$MESSAGE" >&2
    ;;
esac

exit 0
