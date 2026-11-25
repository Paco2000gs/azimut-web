#!/usr/bin/env bash
# Social media renderer (runs in GitHub Actions, see .github/workflows/social-media.yml).
#
#   1. GET  $SITE_URL/api/social/worker/job      -> photos + signed upload URLs
#   2. ffmpeg: ig/NN.jpg (1080x1350, 4:5), web/NN.jpg (<=2048px, JPEG),
#      video/video.mp4 (1920x1080) and video/short.mp4 (1080x1920)
#   3. PUT every file to its signed URL
#   4. POST $SITE_URL/api/social/worker/done      -> drafts get their media
#
# Local dry run (no uploads, files left in ./social-out):
#   LOCAL_ONLY=1 JOB_JSON=job.json bash scripts/social-media/render.sh
set -Eeuo pipefail

: "${PROPERTY_ID:?PROPERTY_ID is required}"
SITE_URL="${SITE_URL:-https://www.azimutproperty.com}"
LOCAL_ONLY="${LOCAL_ONLY:-0}"
[[ "$PROPERTY_ID" =~ ^[0-9]+$ ]] || { echo "PROPERTY_ID must be numeric" >&2; exit 1; }

FONT="$(fc-match -f '%{file}' 'DejaVu Sans:bold' 2>/dev/null || true)"
[[ -f "$FONT" ]] || FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

WORK="${WORK_DIR:-$(mktemp -d)}"
OUT="$WORK/out"
mkdir -p "$WORK/src" "$OUT/ig" "$OUT/web" "$OUT/video" "$WORK/clips"

report_failure() {
  local msg="$1"
  echo "::error::$msg"
  if [[ "$LOCAL_ONLY" != "1" ]]; then
    jq -n --argjson id "$PROPERTY_ID" --arg e "$msg" '{property_id:$id, ok:false, error:$e}' |
      curl -sS -X POST "$SITE_URL/api/social/worker/done" \
        -H "Authorization: Bearer $VIDEO_WORKER_SECRET" -H "Content-Type: application/json" --data @- >/dev/null || true
  fi
}
trap 'report_failure "render.sh failed at line $LINENO"' ERR

# --- 1. Job --------------------------------------------------------------
if [[ -n "${JOB_JSON:-}" ]]; then
  cp "$JOB_JSON" "$WORK/job.json"
else
  : "${VIDEO_WORKER_SECRET:?VIDEO_WORKER_SECRET is required}"
  curl -fsS "$SITE_URL/api/social/worker/job?property_id=$PROPERTY_ID" \
    -H "Authorization: Bearer $VIDEO_WORKER_SECRET" -o "$WORK/job.json"
fi
# Signed upload URLs are bearer credentials and this repo's logs are public.
jq -r '.uploads[]?' "$WORK/job.json" | while read -r u; do echo "::add-mask::$u"; done

TITLE="$(jq -r '.property.title' "$WORK/job.json")"
LOCATION="$(jq -r '.property.location' "$WORK/job.json")"
PRICE="$(jq -r '.property.price' "$WORK/job.json")"
LINK="$(jq -r '.property.link' "$WORK/job.json")"
LOGO_URL="$(jq -r '.logo_url' "$WORK/job.json")"
mapfile -t PHOTOS < <(jq -r '.photos[]' "$WORK/job.json")
(( ${#PHOTOS[@]} > 0 )) || { report_failure "no photos"; exit 1; }

# drawtext reads from files so titles never need shell/ffmpeg escaping, and
# does not wrap: long titles are wrapped here (python, because `fold` splits
# multi-byte UTF-8 characters such as "á").
python3 -c 'import sys, textwrap; print("\n".join(textwrap.wrap(sys.argv[1], 34)[:3]), end="")' "$TITLE" > "$WORK/title.txt"
printf '%s' "$LOCATION" > "$WORK/location.txt"
printf '%s' "$PRICE"    > "$WORK/price.txt"
printf '%s' "${LINK#https://}" > "$WORK/link.txt"
curl -fsSL "$LOGO_URL" -o "$WORK/logo.png" || true

# --- 2a. Still images ----------------------------------------------------
IG_KEYS=(); WEB_KEYS=()
for i in "${!PHOTOS[@]}"; do
  n=$(printf '%02d' $((i + 1)))
  src="$WORK/src/$n"
  curl -fsSL "${PHOTOS[$i]}" -o "$src"
  # Instagram: JPEG only, 4:5 is the tallest ratio it accepts; centre crop.
  ffmpeg -loglevel error -y -i "$src" \
    -vf "scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,format=yuvj420p" \
    -q:v 3 "$OUT/ig/$n.jpg"
  # Facebook / LinkedIn: keep the framing, JPEG, long side <= 2048, under 4 MB.
  ffmpeg -loglevel error -y -i "$src" \
    -vf "scale='min(2048,iw)':'min(2048,ih)':force_original_aspect_ratio=decrease,format=yuvj420p" \
    -q:v 3 "$OUT/web/$n.jpg"
  if (( $(stat -c %s "$OUT/web/$n.jpg") > 3900000 )); then
    ffmpeg -loglevel error -y -i "$src" \
      -vf "scale='min(2048,iw)':'min(2048,ih)':force_original_aspect_ratio=decrease,format=yuvj420p" \
      -q:v 7 "$OUT/web/$n.jpg"
  fi
  IG_KEYS+=("ig/$n.jpg"); WEB_KEYS+=("web/$n.jpg")
done

# --- 2b. Videos ----------------------------------------------------------
# One Ken Burns clip per photo (slow centred zoom), plus a title card and an
# end card, concatenated and given a silent AAC track (or music.mp3 if the
# repo has one with a licence that allows it).
render_video() {
  local W=$1 H=$2 SECS=$3 NAME=$4
  local FPS=30 FRAMES=$((SECS * FPS)) list="$WORK/clips/$NAME.txt"
  local BIG_W=$((W * 3 / 2)) BIG_H=$((H * 3 / 2))
  local FS_TITLE=$((W / 26)) FS_SUB=$((W / 40))
  : > "$list"

  # Title card: first photo, darkened, title + location.
  ffmpeg -loglevel error -y -loop 1 -framerate $FPS -t 3 -i "$WORK/src/01" -vf "
    scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,boxblur=8,eq=brightness=-0.25,
    drawtext=fontfile=$FONT:textfile=$WORK/title.txt:fontcolor=white:fontsize=$FS_TITLE:x=(w-text_w)/2:y=(h-text_h)/2-h*0.06:line_spacing=$((FS_TITLE / 4)),
    drawtext=fontfile=$FONT:textfile=$WORK/location.txt:fontcolor=0xD4AF37:fontsize=$FS_SUB:x=(w-text_w)/2:y=h*0.62,
    format=yuv420p" -c:v libx264 -preset veryfast -crf 20 -r $FPS "$WORK/clips/${NAME}_00.mp4"
  echo "file '$WORK/clips/${NAME}_00.mp4'" >> "$list"

  local i=1
  for src in "$WORK"/src/*; do
    local clip="$WORK/clips/${NAME}_$(printf '%02d' $i).mp4"
    ffmpeg -loglevel error -y -i "$src" -frames:v $FRAMES -vf "
      scale=$BIG_W:$BIG_H:force_original_aspect_ratio=increase,crop=$BIG_W:$BIG_H,
      zoompan=z='min(zoom+0.0007,1.15)':d=$FRAMES:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=$FPS,
      format=yuv420p" -c:v libx264 -preset veryfast -crf 20 -r $FPS "$clip"
    echo "file '$clip'" >> "$list"
    i=$((i + 1))
  done

  # End card: price, web address, logo.
  local logo_in=() logo_fx="[bg]null[v]"
  if [[ -s "$WORK/logo.png" ]]; then
    logo_in=(-i "$WORK/logo.png")
    logo_fx="[1:v]scale=-1:$((H / 6))[lg];[bg][lg]overlay=(W-w)/2:H*0.18[v]"
  fi
  ffmpeg -loglevel error -y -f lavfi -i "color=c=0x111111:s=${W}x${H}:r=$FPS:d=3" "${logo_in[@]}" -filter_complex "
    [0:v]drawtext=fontfile=$FONT:textfile=$WORK/price.txt:fontcolor=0xD4AF37:fontsize=$FS_TITLE:x=(w-text_w)/2:y=h*0.52,
    drawtext=fontfile=$FONT:textfile=$WORK/link.txt:fontcolor=white:fontsize=$((FS_SUB * 3 / 4)):x=(w-text_w)/2:y=h*0.66[bg];
    $logo_fx" -map "[v]" -frames:v $((3 * FPS)) -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$WORK/clips/${NAME}_99.mp4"
  echo "file '$WORK/clips/${NAME}_99.mp4'" >> "$list"

  local audio=(-f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000")
  [[ -f scripts/social-media/music.mp3 ]] && audio=(-stream_loop -1 -i scripts/social-media/music.mp3)
  ffmpeg -loglevel error -y -f concat -safe 0 -i "$list" "${audio[@]}" \
    -map 0:v -map 1:a -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart \
    "$OUT/video/$NAME.mp4"
}

render_video 1920 1080 4 video
render_video 1080 1920 3 short   # 12 photos x 3 s + 6 s of cards = 42 s max

# --- 3. Upload -----------------------------------------------------------
if [[ "$LOCAL_ONLY" == "1" ]]; then
  rm -rf ./social-out && cp -r "$OUT" ./social-out
  echo "LOCAL_ONLY: files in ./social-out"
  trap - ERR
  exit 0
fi

upload() {
  local key=$1 type=$2
  local url; url="$(jq -r --arg k "$key" '.uploads[$k]' "$WORK/job.json")"
  [[ "$url" != "null" ]] || { echo "no signed URL for $key" >&2; return 1; }
  curl -fsS -X PUT "$url" -H "Content-Type: $type" -H "x-upsert: true" --data-binary "@$OUT/$key" >/dev/null
}
for k in "${IG_KEYS[@]}" "${WEB_KEYS[@]}"; do upload "$k" image/jpeg; done
upload video/video.mp4 video/mp4
upload video/short.mp4 video/mp4

# --- 4. Report -----------------------------------------------------------
jq -n --argjson id "$PROPERTY_ID" \
  --argjson ig "$(printf '%s\n' "${IG_KEYS[@]}" | jq -R . | jq -s .)" \
  --argjson web "$(printf '%s\n' "${WEB_KEYS[@]}" | jq -R . | jq -s .)" \
  '{property_id:$id, ok:true, ig:$ig, web:$web}' |
  curl -fsS -X POST "$SITE_URL/api/social/worker/done" \
    -H "Authorization: Bearer $VIDEO_WORKER_SECRET" -H "Content-Type: application/json" --data @- >/dev/null

trap - ERR
echo "Done: ${#IG_KEYS[@]} photos, video + short for property $PROPERTY_ID"
