#!/bin/bash
echo "Starting deploy of LunnNet..."

force=0
changed=0

while getopts f opt; do
    case $opt in
        f)
	echo "Force flag set" 
	force=1
        ;;
    esac
done

git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1
if [ $changed = 1 ] || [ $force = 1 ]; then
	git pull 
	echo "Installing Client..."
	cd Client
	rm -rf build
	rm -rf node_modules
	npm install --no-save
	npm run build
	npm prune --production
	echo "Client installed"

	echo "Installing Server..."
	cd ../Server
	rm -rf dist
	rm -rf node_modules
	npm install --no-save
	npm run build
	npm prune --production
	pm2 startOrReload process.yml
	echo "Server installed"

	echo "Deloy successfull"
else
	echo "Up-to-date. Use force flag (-f) to force a deploy."
fi







