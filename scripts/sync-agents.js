#!/usr/bin/env node
/** Copies rules/ into the skill's references and the package version into the plugin and the Android build. */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const references = path.join(root, 'skills', 'react-native-duo', 'references');
fs.mkdirSync(references, {recursive: true});
for (const name of fs.readdirSync(references)) fs.rmSync(path.join(references, name));
for (const name of fs.readdirSync(path.join(root, 'rules'))) fs.copyFileSync(path.join(root, 'rules', name), path.join(references, name));

const {version} = require(path.join(root, 'package.json'));
const pluginFile = path.join(root, '.claude-plugin', 'plugin.json');
const plugin = JSON.parse(fs.readFileSync(pluginFile, 'utf8'));
plugin.version = version;
fs.writeFileSync(pluginFile, `${JSON.stringify(plugin, null, 2)}\n`);

const gradleFile = path.join(root, 'android', 'build.gradle');
const gradle = fs.readFileSync(gradleFile, 'utf8');
fs.writeFileSync(gradleFile, gradle.replace(/^version = ['"][^'"]*['"]/m, `version = '${version}'`));
