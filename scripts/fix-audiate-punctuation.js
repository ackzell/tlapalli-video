#!/usr/bin/env node

/*
  Merge standalone punctuation transcription tokens into the previous token.

  Supported punctuation tokens:
  - ","
  - "."
  - "..."
  - ":"

  Supported files:
  - .audiate
  - .bc.json

  Usage:
    node scripts/fix-audiate-punctuation.js /path/to/project-or-file
    node scripts/fix-audiate-punctuation.js /path/to/project --dry-run
    node scripts/fix-audiate-punctuation.js /path/to/project --no-backup
*/

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const positional = args.filter((a) => !a.startsWith('--'));

  if (positional.length !== 1) {
    printUsageAndExit(1);
  }

  return {
    inputPath: path.resolve(positional[0]),
    dryRun: flags.has('--dry-run'),
    noBackup: flags.has('--no-backup'),
  };
}

function printUsageAndExit(code) {
  console.log('Usage:');
  console.log('  node scripts/fix-audiate-punctuation.js <path> [--dry-run] [--no-backup]');
  console.log('');
  console.log('Where <path> can be:');
  console.log('  - An Audiate project directory (contains .audiate and/or Project Data/*.bc.json)');
  console.log('  - A single .audiate file');
  console.log('  - A single .bc.json file');
  process.exit(code);
}

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function collectTargetFiles(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error('Path does not exist: ' + inputPath);
  }

  const stat = fs.statSync(inputPath);
  if (stat.isFile()) {
    if (inputPath.endsWith('.audiate') || inputPath.endsWith('.bc.json')) {
      return [inputPath];
    }
    throw new Error('Unsupported file type. Use a .audiate or .bc.json file.');
  }

  if (!stat.isDirectory()) {
    throw new Error('Input must be a file or directory.');
  }

  const files = walk(inputPath);
  const targets = files.filter((f) => {
    const normalized = f.split(path.sep).join('/');

    if (normalized.includes('/Backup/')) {
      return false;
    }

    if (normalized.endsWith('.bak') || normalized.includes('.bak.')) {
      return false;
    }

    return normalized.endsWith('.audiate') || normalized.endsWith('.bc.json');
  });

  return targets;
}

function parseValueField(valueString) {
  try {
    return JSON.parse(valueString);
  } catch {
    return null;
  }
}

function transformProjectJson(doc) {
  const result = {
    merged: 0,
    skippedAtStart: 0,
    beforeComma: 0,
    beforeDot: 0,
    beforeEllipsis: 0,
    beforeColon: 0,
    afterComma: 0,
    afterDot: 0,
    afterEllipsis: 0,
    afterColon: 0,
  };

  const PUNCTUATION = [',', '.', '...', ':'];

  const scenes = doc && doc.timeline && doc.timeline.sceneTrack && doc.timeline.sceneTrack.scenes;
  if (!Array.isArray(scenes)) {
    return result;
  }

  for (const scene of scenes) {
    const tracks = scene && scene.csml && scene.csml.tracks;
    if (!Array.isArray(tracks)) {
      continue;
    }

    for (const track of tracks) {
      const keyframes =
        track && track.parameters && track.parameters.transcription && track.parameters.transcription.keyframes;
      if (!Array.isArray(keyframes)) {
        continue;
      }

      for (let i = 0; i < keyframes.length; i++) {
        const current = keyframes[i];
        const currentValue = parseValueField(current.value);
        if (!currentValue || typeof currentValue.text !== 'string') {
          continue;
        }

        const mark = currentValue.text;
        if (!PUNCTUATION.includes(mark)) {
          continue;
        }

        if (mark === ',') {
          result.beforeComma++;
        } else if (mark === '.') {
          result.beforeDot++;
        } else if (mark === '...') {
          result.beforeEllipsis++;
        } else if (mark === ':') {
          result.beforeColon++;
        }

        if (i === 0) {
          result.skippedAtStart++;
          continue;
        }

        const previous = keyframes[i - 1];
        const previousValue = parseValueField(previous.value);
        if (!previousValue || typeof previousValue.text !== 'string') {
          continue;
        }

        previousValue.text = previousValue.text + mark;
        previous.value = JSON.stringify(previousValue);

        keyframes.splice(i, 1);
        i--;
        result.merged++;
      }

      for (const kf of keyframes) {
        const v = parseValueField(kf.value);
        if (!v || typeof v.text !== 'string') {
          continue;
        }
        if (v.text === ',') {
          result.afterComma++;
        } else if (v.text === '.') {
          result.afterDot++;
        } else if (v.text === '...') {
          result.afterEllipsis++;
        } else if (v.text === ':') {
          result.afterColon++;
        }
      }
    }
  }

  return result;
}

function ensureBackup(filePath, content) {
  const backupPath = filePath + '.bak';
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content, 'utf8');
    return backupPath;
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const versioned = filePath + '.' + ts + '.bak';
  fs.writeFileSync(versioned, content, 'utf8');
  return versioned;
}

function processFile(filePath, options) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (err) {
    return {
      filePath,
      ok: false,
      error: 'Invalid JSON: ' + err.message,
    };
  }

  const stats = transformProjectJson(doc);
  const beforeTotal = stats.beforeComma + stats.beforeDot + stats.beforeEllipsis + stats.beforeColon;
  const afterTotal = stats.afterComma + stats.afterDot + stats.afterEllipsis + stats.afterColon;

  let backupPath = null;
  if (!options.dryRun && !options.noBackup && beforeTotal > 0) {
    backupPath = ensureBackup(filePath, raw);
  }

  if (!options.dryRun && beforeTotal > 0) {
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  }

  return {
    filePath,
    ok: true,
    backupPath,
    merged: stats.merged,
    skippedAtStart: stats.skippedAtStart,
    before: {
      comma: stats.beforeComma,
      dot: stats.beforeDot,
      ellipsis: stats.beforeEllipsis,
      total: beforeTotal,
    },
    after: {
      comma: stats.afterComma,
      dot: stats.afterDot,
      ellipsis: stats.afterEllipsis,
      total: afterTotal,
    },
  };
}

function main() {
  const options = parseArgs(process.argv);
  const files = collectTargetFiles(options.inputPath);

  if (files.length === 0) {
    console.log('No .audiate or .bc.json files found at: ' + options.inputPath);
    process.exit(0);
  }

  const results = files.map((f) => processFile(f, options));

  let processed = 0;
  let failed = 0;
  let mergedTotal = 0;

  for (const r of results) {
    if (!r.ok) {
      failed++;
      console.log('FAIL  ' + r.filePath);
      console.log('  ' + r.error);
      continue;
    }

    processed++;
    mergedTotal += r.merged;
    console.log('OK    ' + r.filePath);
    console.log(
      '  before: ' + r.before.total +
        ' (comma=' + r.before.comma +
        ', dot=' + r.before.dot +
        ', ellipsis=' + r.before.ellipsis +
        ', colon=' + r.before.colon + ')'
    );
    console.log(
      '  merged: ' + r.merged +
        ' | remaining: ' + r.after.total +
        ' (comma=' + r.after.comma +
        ', dot=' + r.after.dot +
        ', ellipsis=' + r.after.ellipsis +
        ', colon=' + r.after.colon + ')'
    );
    if (r.skippedAtStart > 0) {
      console.log('  skippedAtStart: ' + r.skippedAtStart);
    }
    if (r.backupPath) {
      console.log('  backup: ' + r.backupPath);
    }
  }

  console.log('');
  console.log('Summary');
  console.log('  processed: ' + processed);
  console.log('  failed: ' + failed);
  console.log('  mergedTotal: ' + mergedTotal);
  console.log('  mode: ' + (options.dryRun ? 'dry-run' : 'write'));

  if (failed > 0) {
    process.exit(1);
  }
}

main();
