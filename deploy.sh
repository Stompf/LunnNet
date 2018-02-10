#!/bin/bash
echo "Starting deploy of LunnNet..."

force=0
client=0
server=0
changed=0

while getopts fcs opt; do
    case $opt in
        f)
	echo "Force flag set" 
	force=1
        ;;
		c)
	echo "Client flag set" 
	client=1
        ;;
		s)
	echo "Server flag set" 
	server=1
        ;;
    esac
done

if [ $client == 0 ] && [ $server == 0 ]; then
	client=1
	server=1
fi

git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1
if [ $changed = 1 ] || [ $force = 1 ]; then
	git pull 

	if [ $client == 1 ]; then
		echo "Installing Client..."
		cd Client
		rm -rf build
		npm install --no-save
		npm run build
		npm prune --production
		echo "Client installed"
	fi

	if [ $server == 1 ]; then
		echo "Installing Server..."
		cd ../Server
		rm -rf dist
		npm install --no-save
		npm run build
		npm prune --production
		pm2 startOrReload process.yml
		echo "Server installed"
	fi

	echo "Deploy finished"
else
	echo "Up-to-date. Use force flag (-f) to force a deploy."
fi







