#! /bin/sh

cd ~/
mkdir ./.drafter_tmp
cd ./drafter_tmp
curl https://raw.githubusercontent.com/L-Zephyr/static_resource/master/Drafter/Drafter.zip -o ./drafter.zip
unzip drafter.zip
cp -f -r ./drafter/Template/ ~/.drafter
cp -f ./drafter/drafter /usr/local/bin/drafter
cd ~/
rm -rf ./.drafter_tmp