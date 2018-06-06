#! /bin/sh

# curl https://raw.githubusercontent.com/L-Zephyr/static_resource/master/RxTemplate/install.sh | /bin/sh

cd ~/
curl -o ./RxTemplate.zip https://raw.githubusercontent.com/L-Zephyr/static_resource/master/RxTemplate/Rx%20View%20Model.xctemplate.zip
~/Library/Developer/Xcode/Templates
unzip -o RxTemplate.zip -d ~/Library/Developer/Xcode/Templates/File\ Templates
rm RxTemplate.zip