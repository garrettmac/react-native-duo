import {execFileSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const cli = path.join(root, 'bin', 'react-native-duo.js');
const read = (...parts: string[]) => fs.readFileSync(path.join(...parts), 'utf8');
const run = (cwd: string, ...args: string[]) => execFileSync('node', [cli, 'agents', '--cwd', cwd, ...args], {encoding: 'utf8'});

describe('the agent rules', () => {
  it('ship the same rules in rules/ and the skill', () => {
    const names = fs.readdirSync(path.join(root, 'rules')).sort();
    expect(names).toEqual(['apple-guidelines.md', 'core.md', 'duo.md']);
    expect(fs.readdirSync(path.join(root, 'skills', 'react-native-duo', 'references')).sort()).toEqual(names);
    for (const name of names) expect(read(root, 'skills', 'react-native-duo', 'references', name)).toBe(read(root, 'rules', name));
  });

  it('carry the package version into the plugin and the Android build', () => {
    const {version} = JSON.parse(read(root, 'package.json'));
    expect(JSON.parse(read(root, '.claude-plugin', 'plugin.json')).version).toBe(version);
    expect(read(root, 'android', 'build.gradle')).toContain(`version = '${version}'`);
  });

  it('name only exports that exist', () => {
    const api = {...require('../index'), ...require('../layout'), ...require('../testing')};
    const text = read(root, 'rules', 'duo.md') + read(root, 'rules', 'core.md');
    const hooks = [...text.matchAll(/`(use[A-Z]\w*)\(/g)].map(m => m[1]);
    const components = [...text.matchAll(/<([A-Z]\w+)[ >]/g)].map(m => m[1]);
    const named = [...new Set([...hooks, ...components])].filter(name => !['useWindowDimensions', 'Map', 'Sheet', 'List', 'Detail', 'Day', 'DayMap', 'Screen'].includes(name));
    expect(named.length).toBeGreaterThan(10);
    for (const name of named) expect(api).toHaveProperty(name);
  });

  it('give the skill a name and a description', () => {
    expect(read(root, 'skills', 'react-native-duo', 'SKILL.md')).toMatch(/^---\nname: react-native-duo\ndescription: .+\n---\n/);
  });
});

describe('npx react-native-duo agents', () => {
  let project: string;

  beforeEach(() => {
    project = fs.mkdtempSync(path.join(os.tmpdir(), 'duo-agents-'));
  });

  afterEach(() => {
    fs.rmSync(project, {recursive: true, force: true});
  });

  it('imports the core rules into CLAUDE.md, installs a skill that reads the package and points AGENTS.md at it', () => {
    fs.writeFileSync(path.join(project, 'AGENTS.md'), '# My app\n\nUse tabs.\n');
    run(project);
    const installedSkill = read(project, '.claude', 'skills', 'react-native-duo', 'SKILL.md');
    expect(installedSkill).toContain('name: react-native-duo');
    expect(installedSkill).toContain('`node_modules/@garrettmacmac/react-native-duo/rules/duo.md`');
    expect(installedSkill).not.toContain('references/');
    expect(read(project, 'CLAUDE.md')).toContain('@node_modules/@garrettmacmac/react-native-duo/rules/core.md');
    const agents = read(project, 'AGENTS.md');
    expect(agents.startsWith('# My app\n\nUse tabs.\n\n<!-- react-native-duo:start -->')).toBe(true);
    expect(fs.existsSync(path.join(project, '.cursor'))).toBe(false);
  });

  it('is safe to run twice and can be taken back out', () => {
    fs.writeFileSync(path.join(project, 'AGENTS.md'), '# My app\n');
    run(project);
    const once = read(project, 'AGENTS.md');
    run(project);
    expect(read(project, 'AGENTS.md')).toBe(once);
    run(project, '--remove');
    expect(read(project, 'AGENTS.md')).toBe('# My app\n');
    expect(fs.existsSync(path.join(project, 'CLAUDE.md'))).toBe(false);
    expect(fs.existsSync(path.join(project, '.claude', 'skills', 'react-native-duo'))).toBe(false);
  });

  it('writes a Cursor rule when the project uses Cursor', () => {
    fs.mkdirSync(path.join(project, '.cursor'));
    run(project);
    expect(read(project, '.cursor', 'rules', 'react-native-duo.mdc')).toMatch(/^---\ndescription: .+\nalwaysApply: true\n---\n\n# iPhone Duo/);
    expect(read(project, '.cursor', 'rules', 'react-native-duo.mdc')).toContain('`node_modules/@garrettmacmac/react-native-duo/rules/duo.md`');
  });
});
