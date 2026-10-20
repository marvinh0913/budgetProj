#!/usr/bin/env bash
# Build lambda.zip: app code plus Linux (arm64) dependencies.
# Run from backend/:  ./scripts/build_lambda.sh
set -euo pipefail

rm -rf build lambda.zip

pip install \
  --requirement requirements.txt \
  --target build \
  --platform manylinux2014_aarch64 \
  --platform manylinux_2_28_aarch64 \
  --implementation cp \
  --python-version 3.12 \
  --only-binary=:all: \
  --upgrade

cp -r app build/
(cd build && zip -qr ../lambda.zip .)

echo "Built lambda.zip ($(du -h lambda.zip | cut -f1))"