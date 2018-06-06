#! /bin/sh

cd ~/
curl -o ./RxTemplate.zip https://raw.githubusercontent.com/L-Zephyr/static_resource/master/RxTemplate/Rx%20View%20Model.xctemplate.zip
unzip -o RxTemplate.zip -d ~/Library/Developer/Xcode/Templates/File\ Templates
rm RxTemplate.zip