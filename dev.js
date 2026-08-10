const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const isWindows = process.platform === 'win32';

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    ...options,
  });

  child.on('error', (error) => {
    console.error(`\nFailed to start ${command}:`, error.message);
    shutdown();
    process.exit(1);
  });

  return child;
}

// Start the Express API using the same Node executable that launched this script.
const server = startProcess(process.execPath, [path.join(rootDir, 'server.js')]);

// On Windows, .cmd files (including npm.cmd) are safest when launched through
// cmd.exe. This also avoids spawn EINVAL on recent Node.js versions.
const client = isWindows
  ? startProcess(
      process.env.ComSpec || 'cmd.exe',
      ['/d', '/s', '/c', 'npm --prefix client run dev'],
      { windowsHide: false }
    )
  : startProcess('npm', ['--prefix', 'client', 'run', 'dev']);

const children = [server, client];
let shuttingDown = false;

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) return;
  shuttingDown = true;

  children.forEach((child) => {
    if (child && !child.killed) {
      try {
        child.kill(signal);
      } catch (_) {
        // Process may already have exited.
      }
    }
  });
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
  process.exit(0);
});

children.forEach((child) => {
  child.on('exit', (code) => {
    if (!shuttingDown && typeof code === 'number' && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });
});
