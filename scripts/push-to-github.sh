#!/usr/bin/env bash
# melikerge59-create/Laperla reposuna gönderir.
#
# Tek seferlik (önerilen): GitHub → Settings → Developer settings → Personal access tokens
# https://github.com/settings/tokens
# Classic PAT: "repo" + "workflow" (Actions dosyalari icin) — sonra:
#
#   export GITHUB_TOKEN=ghp_xxxxxxxx
#   ./scripts/push-to-github.sh
#
# Token'ı sohbete yapıştırmayın. İsteğe bağlı: proje kökündeki .env.local içine
#   GITHUB_TOKEN=ghp_...
# (bu dosya .gitignore'da; repoya gitmez)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# source yerine satir okuma: yorumlardaki ozel karakterler ve bos satirlar guvenli
load_github_token_from_env_local() {
  [[ -f "$ROOT/.env.local" ]] || return 0
  local line key val
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" == GITHUB_TOKEN=* ]] || continue
    val="${line#GITHUB_TOKEN=}"
    val="${val%$'\r'}"
    val="${val#"${val%%[![:space:]]*}"}"
    val="${val%"${val##*[![:space:]]}"}"
    val="${val#\"}"
    val="${val%\"}"
    val="${val#\'}"
    val="${val%\'}"
    [[ -n "$val" ]] && printf -v GITHUB_TOKEN '%s' "$val" && export GITHUB_TOKEN && break
  done <"$ROOT/.env.local"
  # set -e: while son iterasyonda [[ -n "$val" ]] basarisiz olunca dongu cikisi 1 olabiliyor
  true
}
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  load_github_token_from_env_local
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "HATA: GITHUB_TOKEN bos. .env.local icinde 'GITHUB_TOKEN=ghp_...' satirini doldurup Cmd+S ile kaydedin." >&2
  echo "Token: https://github.com/settings/tokens" >&2
  exit 1
fi

REPO_URL="https://github.com/melikerge59-create/Laperla.git"
if ! git remote get-url origin &>/dev/null; then
  git remote add origin "$REPO_URL"
else
  git remote set-url origin "$REPO_URL"
fi

git branch -M main

# melikerge59-create hesabina ait PAT
git push -u "https://melikerge59-create:${GITHUB_TOKEN}@github.com/melikerge59-create/Laperla.git" main

echo "Tamam: https://github.com/melikerge59-create/Laperla"
