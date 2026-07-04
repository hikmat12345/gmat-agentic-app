// Blocks any Edit or Write to the pre-existing video editor.
// Claude Code passes the tool input as JSON on stdin.
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const filePath = (input.file_path || '').replace(/\\/g, '/');

    // Paths that must never be modified — the working video editor
    const PROTECTED = [
      'app/editor',
      'app/render',
      'app/versions',
      'components/editor',
      'modules/rendering',
      'MotionForceFrontend/whisper',
      'DEFAULT_OVERLAYS.json',
    ];

    const match = PROTECTED.find(p => filePath.includes(p));
    if (match) {
      process.stderr.write(
        `\n⛔  EDIT BLOCKED — protected video editor area\n` +
        `   File : ${filePath}\n` +
        `   Rule : "${match}" is off-limits.\n` +
        `   Why  : The video editor already works. Any change risks breaking it.\n` +
        `   Fix  : Work around it, or ask the user if this edit is truly intentional.\n\n`
      );
      process.exit(2);
    }
  } catch (_) {
    // Unparseable input → allow (fail open)
  }
  process.exit(0);
});
