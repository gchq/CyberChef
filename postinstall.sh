#!/bin/bash

# Add file extensions to Crypto-Api imports
if [[ "$OSTYPE" == "darwin"* ]]; then
  find ./node_modules/crypto-api/src/ \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i '' -e '/\.mjs/!s/\(from "\.[^"]*\)";/\1.mjs";/g'
else
  find ./node_modules/crypto-api/src/ \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i -e '/\.mjs/!s/\(from "\.[^"]*\)";/\1.mjs";/g'
fi