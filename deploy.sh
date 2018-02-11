#!/bin/bash
echo "INFO: Starting deploy of LunnNet..."

force=0
client=0
server=0
changed=0

while getopts fcs opt; do
    case $opt in
        f)
	echo "INFO: Force flag set" 
	force=1
        ;;
        c)
	echo "INFO: Client flag set" 
	client=1
        ;;
        s)
	echo "INFO: Server flag set" 
	server=1
        ;;
    esac
done

if [ $client -eq 0 ] && [ $server -eq 0 ]; then
	client=1
	server=1
fi

git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1
if [ $changed -eq 1 ] || [ $force -eq 1 ]; then
	git pull 

	if [ $client -eq 1 ]; then
		echo "INFO: Installing Client..."
		cd Client
		rm -rf build
		npm install --no-save
		npm run build
		cd ..
		echo "INFO: Client installed"
	fi

	if [ $server -eq 1 ]; then
		echo "INFO: Installing Server..."
		cd Server
		rm -rf dist
		npm install --no-save
		npm run build
		pm2 startOrReload process.yml
		echo "INFO: Server installed"
	fi

	echo "Deploy finished"
else
	echo "Up-to-date. Use force flag (-f) to force a deploy."
fi







