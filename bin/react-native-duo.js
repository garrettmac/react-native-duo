#!/usr/bin/env node
/**
 * Points an app's coding agents at the package's rules: the core rules imported into CLAUDE.md, a thin Claude Code
 * skill and an AGENTS.md pointer that read the full rules from the installed package, and a Cursor rule. Safe to
 * re-run: each file keeps one marked block that is replaced in place.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PACKAGE = '@garrettmacmac/react-native-duo';
const ROOT = path.resolve(__dirname, '..');
const START = '<!-- react-native-duo:start -->';
const END = '<!-- react-native-duo:end -->';

const USAGE = `Usage: npx @garrettmacmac/react-native-duo agents [options]

Adds the iPhone Duo rules to this project's agent instructions.

Options:
  --cwd <dir>     Project root (default: the current directory)
  --only <list>   Comma-separated targets: claude, agents, cursor (default: claude,agents, plus cursor when .cursor exists)
  --remove        Take the rules back out
  --help          Show this help

The installed files point at the package in node_modules; re-run after upgrading it.
`;

function parse(argv) {
  const options = {command: null, cwd: process.cwd(), only: null, remove: false, help: false};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--remove') options.remove = true;
    else if (arg === '--cwd') options.cwd = path.resolve(argv[++i] ?? '.');
    else if (arg === '--only') options.only = (argv[++i] ?? '').split(',').map(s => s.trim()).filter(Boolean);
    else if (!options.command) options.command = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function block(body) {
  return `${START}\n${body.trim()}\n${END}`;
}

function upsert(file, body, remove) {
  const exists = fs.existsSync(file);
  const current = exists ? fs.readFileSync(file, 'utf8') : '';
  const start = current.indexOf(START);
  const end = current.indexOf(END);
  let next;
  if (start !== -1 && end > start) {
    const before = current.slice(0, start).replace(/\n*$/, '');
    const after = current.slice(end + END.length).replace(/^\n*/, '');
    next = remove ? [before, after].filter(Boolean).join('\n\n') : [before, block(body), after].filter(Boolean).join('\n\n');
  } else if (remove) {
    return 'unchanged';
  } else {
    next = current.trim() ? `${current.replace(/\n*$/, '')}\n\n${block(body)}` : block(body);
  }
  next = next ? `${next.replace(/\n*$/, '')}\n` : '';
  if (next === current) return 'unchanged';
  if (remove && next === '' && exists) {
    fs.rmSync(file);
    return 'removed';
  }
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, next);
  return exists ? 'updated' : 'created';
}

function packageDir(cwd) {
  const installed = path.join(cwd, 'node_modules', PACKAGE);
  try {
    const dir = path.dirname(require.resolve(`${PACKAGE}/package.json`, {paths: [cwd]}));
    return dir.split(path.sep).includes('node_modules') ? dir : installed;
  } catch {
    return installed;
  }
}

function rel(cwd, file) {
  return path.relative(cwd, file).split(path.sep).join('/');
}

function skill(rules) {
  const source = fs.readFileSync(path.join(ROOT, 'skills', 'react-native-duo', 'SKILL.md'), 'utf8');
  return source
    .replace(/references\/(duo|apple-guidelines)\.md/g, (_, name) => `${rules}/${name}.md`)
    .replace('\n\n1. ', '\n\nPaths below are from the project root.\n\n1. ');
}

const targets = {
  claude(cwd, remove, rules) {
    const dir = path.join(cwd, '.claude', 'skills', 'react-native-duo');
    const results = [];
    if (remove) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, {recursive: true});
        results.push(['.claude/skills/react-native-duo', 'removed']);
      }
    } else {
      fs.mkdirSync(dir, {recursive: true});
      fs.writeFileSync(path.join(dir, 'SKILL.md'), skill(rules));
      results.push(['.claude/skills/react-native-duo', 'installed']);
    }
    results.push(['CLAUDE.md', upsert(path.join(cwd, 'CLAUDE.md'), `@${rules}/core.md`, remove)]);
    return results;
  },
  agents(cwd, remove, rules) {
    const pointer = `## iPhone Duo, foldables and iPad

This app uses \`${PACKAGE}\`. Before writing or changing any screen, read \`${rules}/core.md\`, then \`${rules}/duo.md\`
for the full rules and API, and follow them.`;
    return [['AGENTS.md', upsert(path.join(cwd, 'AGENTS.md'), pointer, remove)]];
  },
  cursor(cwd, remove, rules) {
    const file = path.join(cwd, '.cursor', 'rules', 'react-native-duo.mdc');
    if (remove) {
      if (!fs.existsSync(file)) return [];
      fs.rmSync(file);
      return [['.cursor/rules/react-native-duo.mdc', 'removed']];
    }
    const core = fs.readFileSync(path.join(ROOT, 'rules', 'core.md'), 'utf8')
      .replace('`duo.md` beside this file', `\`${rules}/duo.md\``)
      .replace('`apple-guidelines.md`', `\`${rules}/apple-guidelines.md\``);
    const header = '---\ndescription: iPhone Duo, foldable and iPad layout rules for @garrettmacmac/react-native-duo\nalwaysApply: true\n---\n\n';
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, header + core);
    return [['.cursor/rules/react-native-duo.mdc', 'written']];
  },
};

function main() {
  const options = parse(process.argv.slice(2));
  if (options.help || options.command !== 'agents') {
    process.stdout.write(USAGE);
    process.exit(options.help ? 0 : 1);
  }
  const defaults = ['claude', 'agents', ...(fs.existsSync(path.join(options.cwd, '.cursor')) ? ['cursor'] : [])];
  const chosen = options.only ?? defaults;
  for (const name of chosen) {
    if (!targets[name]) throw new Error(`Unknown target: ${name} (use claude, agents or cursor)`);
  }
  const rules = `${rel(options.cwd, packageDir(options.cwd))}/rules`;
  for (const name of chosen) {
    for (const [file, result] of targets[name](options.cwd, options.remove, rules)) process.stdout.write(`${result.padEnd(9)} ${file}\n`);
  }
  if (!options.remove) process.stdout.write('These point at the installed package; re-run after upgrading it.\n');
}

try {
  main();
} catch (error) {
  process.stderr.write(`react-native-duo: ${error.message}\n`);
  process.exit(1);
}
