#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import uniqueString from 'unique-string';
import inquirer from 'inquirer';
import colors from 'colors';

// CN 您的名字与姓氏是什么?
// OU 您的组织单位名称是什么?
// O  您的组织名称是什么?
// L  您所在的城市或区域名称是什么?
// ST 您所在的省/市/自治区名称是什么?
// C  该单位的双字母国家/地区代码是什么?

const name = 'release.keystore';
const signPath = path.resolve(`android/app/${name}`);

const createSignature = () => {
    const storePassword = uniqueString();
    const keyPassword = uniqueString();
    const alias = path.basename(process.cwd());

    execSync(`keytool -genkey -v -keyalg RSA -keysize 2048 -validity 10000 -keystore "${signPath}" -storepass "${storePassword}" -alias "${alias}" -keypass "${keyPassword}" -dname "CN=NoName, O=NoOrg, C=NoCountry"`);

    console.log('');
    console.log(colors.bgBlack(colors.white('Copy green color code from below to file: ./android/app/build.gradle')));
    console.log(`android {
    ...
    signingConfigs {
        ...
        release {
            ${colors.green(`storeFile file('${name}')`)}
            ${colors.green(`storePassword "${storePassword}"`)}
            ${colors.green(`keyAlias "${alias}"`)}
            ${colors.green(`keyPassword "${keyPassword}"`)}
        }
    }

    buildTypes {
        ...
        release {
            ...
            ${colors.green('signingConfig signingConfigs.release')}
        }
    }
    ...
}`);
};

if (fs.existsSync(signPath)) {
    inquirer.createPromptModule()<{ override: boolean }>({
        type: 'list',
        name: 'override',
        message: '\nHere exists a signature file, do you want to override it?\n',
        prefix: '',
        suffix: '',
        choices: [
            {
                name: '1. No. Stop doing that',
                value: false,
            },
            {
                name: '2. Yes, I want to override\n',
                value: true,
            },
        ],
    }).then(({ override }) => {
        if (override) {
            fs.unlinkSync(signPath);
            createSignature();
        }
    });
} else {
    createSignature();
}
