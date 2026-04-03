#!/usr/bin/env bash
# melikerge59-create/Laperla reposuna gönderir.
#
# Tek seferlik (önerilen): GitHub → Settings → Developer settings → Personal access tokens
# https://github.com/settings/tokens
# "repo" yetkili classic token oluşturun, sonra:
#
#   export GITHUB_TOKEN=ghp_xxxxxxxx
#   ./scripts/push-to-github.sh
#
# Token'ı repoya veya .env'e kaydetmeyin; komut geçmişine düşebilir.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPO_URL="https://github.com/melikerge59-create/Laperla.git"
if ! git remote get-url origin &>/dev/null; then
  git remote add origin "$REPO_URL"
else
  git remote set-url origin "$REPO_URL"
fi

git branch -M main

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  # melikerge59-create hesabına ait PAT kullanın
  git push -u "https://melikerge59-create:${GITHUB_TOKEN}@github.com/melikerge59-create/Laperla.git" main
else
  echo "GITHUB_TOKEN yok — normal kimlik doğrulama ile push deneniyor (şifre yerine PAT girin)."
  git push -u origin main
fi

echo "Tamam: https://github.com/melikerge59-create/Laperla"
