#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VIDEO_DIR="$SCRIPT_DIR/client_room_video"
FRAMES_DIR="$VIDEO_DIR/frames"
PUBLIC_DIR="$(cd "$SCRIPT_DIR/../public" && pwd)"
OUTPUT_VIDEO="$PUBLIC_DIR/client-room-tour.mp4"
OUTPUT_POSTER="$PUBLIC_DIR/client-room-tour-poster.png"
FADE_DURATION=0.35

python3 "$VIDEO_DIR/capture_slides.py"

SLIDES=(
  "slide_01.png:3.4:3780:2120:0:10:0:6"
  "slide_02.png:3.1:3780:2120:10:0:6:0"
  "slide_03.png:3.2:3780:2120:0:8:6:0"
  "slide_04.png:3.1:3780:2120:8:0:0:6"
  "slide_05.png:3.8:3780:2120:0:6:0:4"
)

INPUT_ARGS=()
FILTER_PARTS=()
DURATIONS=()

for i in "${!SLIDES[@]}"; do
  IFS=':' read -r file dur crop_w crop_h start_x end_x start_y end_y <<< "${SLIDES[$i]}"
  INPUT_ARGS+=( -loop 1 -framerate 30 -t "$dur" -i "$FRAMES_DIR/$file" )
  FILTER_PARTS+=(
    "[${i}:v]crop=${crop_w}:${crop_h}:x='${start_x}+(${end_x}-${start_x})*(t/${dur})':y='${start_y}+(${end_y}-${start_y})*(t/${dur})',scale=1280:720:flags=lanczos,setsar=1,format=yuv420p[v${i}]"
  )
  DURATIONS+=( "$dur" )
done

offset=$(awk "BEGIN { printf \"%.2f\", ${DURATIONS[0]} - $FADE_DURATION }")
FILTER_PARTS+=( "[v0][v1]xfade=transition=fade:duration=${FADE_DURATION}:offset=${offset}[v01]" )
previous="v01"
cumulative="$offset"

for i in $(seq 2 $((${#SLIDES[@]} - 1))); do
  previous_duration="${DURATIONS[$((i - 1))]}"
  cumulative=$(awk "BEGIN { printf \"%.2f\", $cumulative + $previous_duration - $FADE_DURATION }")
  next="v$(printf '%02d' $((i - 1)))$(printf '%02d' $i)"
  FILTER_PARTS+=( "[${previous}][v${i}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${cumulative}[${next}]" )
  previous="$next"
done

FILTER_COMPLEX=$(IFS=';'; echo "${FILTER_PARTS[*]}")

ffmpeg -y "${INPUT_ARGS[@]}" \
  -filter_complex "$FILTER_COMPLEX" \
  -map "[${previous}]" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart \
  "$OUTPUT_VIDEO" >/dev/null 2>&1

ffmpeg -y -i "$OUTPUT_VIDEO" -frames:v 1 "$OUTPUT_POSTER" >/dev/null 2>&1

echo "Built website teaser:"
echo "  $OUTPUT_VIDEO"
echo "  $(du -h "$OUTPUT_VIDEO" | cut -f1)"
