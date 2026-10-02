#!/bin/bash
# The packages build in packages/*/target (mvn clean install at the repository root). The CI copies
# their *-SNAPSHOT.jar and *-SNAPSHOT.tgz into artifacts/ before this script runs; a local run gets
# them here. env.provision.sh installs every one of them, jars first.
mkdir -p ./artifacts
for file in ../packages/*/target/*-SNAPSHOT.jar ../packages/*/target/*-SNAPSHOT.tgz; do
  if [[ -e "$file" ]]; then
    cp "$file" ./artifacts/
  fi
done

version=$(node -p "require('./package.json').devDependencies['@jahia/cypress']")
echo Using @jahia/cypress@$version...
npx --yes --package @jahia/cypress@$version ci.build
