import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'dev', '--workspace', 'backend']],
  ['npm', ['run', 'dev', '--workspace', 'frontend']]
];

const children = commands.map(([cmd, args]) => {
  const child = spawn(cmd, args, { stdio: 'inherit' });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      children.forEach((other) => {
        if (other !== child && !other.killed) other.kill('SIGTERM');
      });
      process.exitCode = code;
    }
  });
  return child;
});

process.on('SIGINT', () => {
  children.forEach((child) => child.kill('SIGINT'));
});

process.on('SIGTERM', () => {
  children.forEach((child) => child.kill('SIGTERM'));
});
