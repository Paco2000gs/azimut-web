#!/usr/bin/env bash
# Verifica los códigos HTTP de las URLs afectadas por los fixes de indexación.
# Ejecutar DESPUÉS de desplegar en Vercel (los redirects/404 son de configuración edge).
# Uso: bash scripts/verify-seo-status.sh
set -u
UA="Mozilla/5.0 (SEO-verify)"

check () {
  local url="$1" expect="$2"
  local code loc
  code=$(curl -s -o /dev/null -w "%{http_code}" -A "$UA" --max-time 25 "$url")
  loc=$(curl -s -o /dev/null -w "%{redirect_url}" -A "$UA" --max-time 25 "$url")
  local mark="  "
  case "$expect" in
    "$code") mark="OK" ;;
    *) mark="!!" ;;
  esac
  printf "[%s] %-4s (esperado %-4s) %-62s -> %s\n" "$mark" "$code" "$expect" "$url" "$loc"
}

echo "== 1) /en debe 301/308 al equivalente ES =="
check "https://www.azimutproperty.com/en/about" 308
check "https://www.azimutproperty.com/en/venta/cadiz" 308

echo "== 2) apex sin www debe 301/308 a www en TODAS las rutas =="
check "https://azimutproperty.com/venta" 308
check "https://azimutproperty.com/blog" 308
check "https://azimutproperty.com/property/villa-ronda-7" 308

echo "== 3) IDs numéricos antiguos que SÍ existen -> 301/308 al slug actual =="
check "https://www.azimutproperty.com/properties/5" 308
check "https://www.azimutproperty.com/property/8" 308
check "https://www.azimutproperty.com/properties/12" 308

echo "== 4) IDs / slugs inexistentes -> 404 REAL =="
check "https://www.azimutproperty.com/property/2" 404
check "https://www.azimutproperty.com/property/9999" 404
check "https://www.azimutproperty.com/blog/hidden-gems-vistahermosa-costa-ballena" 404
check "https://www.azimutproperty.com/esta-pagina-no-existe" 404

echo "== 5) Páginas válidas deben seguir 200 =="
check "https://www.azimutproperty.com/venta" 200
check "https://www.azimutproperty.com/property/villa-ronda-7" 200
check "https://www.azimutproperty.com/blog/why-investors-are-buying-in-jimena-de-la-frontera-in-2026-14" 200
check "https://www.azimutproperty.com/venta/cadiz/finca" 200

echo "Nota: Vercel usa 308 (permanente) y 307 (temporal). 308 = 301 para SEO."
