#!/bin/sh
# Rebuild the film: sh films/pencil-shading/build.sh   (voice: LIB=<library> python tts_ko.py ... is already in voices/)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}; export LIB
cd "$LIB"; PY=.venv/bin/python; D=films/pencil-shading
# voice (needs the session proxy for Microsoft's service): $PY $D/tts_ko.py $D/lines.json $D/voices --voice ko-KR-SunHiNeural --rate=-4%
node core/render/events.mjs $D --size 1080x1920
$PY $D/mix.py
node core/render/video.mjs $D --fps 24 --workers 4 --size 1080x1920 --out $D/out/video.mp4
# master to -14 LUFS (mux.sh needs ffmpeg 7; with 6.x measure with ebur128 and apply the gain instead)
GAIN=$(ffmpeg -nostats -i $D/out/mix.wav -af ebur128 -f null - 2>&1 | awk '/I:/{v=$2} END{printf "%.1f", -14 - v}')
ffmpeg -y -loglevel error -i $D/out/video.mp4 -i $D/out/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "volume=${GAIN}dB,alimiter=limit=0.89:level=disabled,atrim=0:30,asetpts=N/SR/TB" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $D/pencil-shading.mp4
echo built $D/pencil-shading.mp4
