#!/usr/bin/env bash
# Arma la app de escritorio para Windows (64 bits) sin instalar nada en Windows.
# Descarga Electron ya compilado, le agrega el prototipo y lo deja en un .zip listo para usar.
# Uso: ./build-windows.sh [carpeta-de-salida]
set -euo pipefail

ELECTRON_VERSION="33.4.11"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-$HERE/dist}"
NAME="Sin Miedo"
WORK="$OUT/$NAME"

mkdir -p "$OUT"
ZIP="$OUT/electron-v$ELECTRON_VERSION-win32-x64.zip"
if [ ! -f "$ZIP" ]; then
  curl -fsSL -o "$ZIP" "https://github.com/electron/electron/releases/download/v$ELECTRON_VERSION/electron-v$ELECTRON_VERSION-win32-x64.zip"
fi

rm -rf "$WORK"
mkdir -p "$WORK"
unzip -q "$ZIP" -d "$WORK"
mv "$WORK/electron.exe" "$WORK/$NAME.exe"
rm -f "$WORK/resources/default_app.asar"

APP="$WORK/resources/app"
mkdir -p "$APP"
cp "$HERE/package.json" "$HERE/main.js" "$HERE/icon.png" "$APP/"
cp "$HERE/../index.html" "$APP/index.html"

cat > "$WORK/LEEME.txt" <<'TXT'
Sin Miedo - prototipo educativo

Para abrir la app: doble clic en "Sin Miedo.exe".
F11 pone la app en pantalla completa (para presentar). Esc sale de pantalla completa.

Si Windows muestra "Windows protegió su PC", tocá "Más información" y después "Ejecutar de todas formas".
Aparece porque la app no está firmada digitalmente; es normal en un prototipo.

Los precios, comisiones e inflación del simulador son inventados. No es una plataforma real.
TXT

(cd "$OUT" && rm -f "Sin-Miedo-Windows.zip" && zip -qr "Sin-Miedo-Windows.zip" "$NAME")
echo "Listo: $OUT/Sin-Miedo-Windows.zip"
