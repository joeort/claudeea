const fs = require('fs');
const path = require('path');

function fixCalendarSync(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const wf = JSON.parse(content);

  const diffNode = wf.nodes.find(n => n.id === 'compute-diff' || n.id === 'compute-diff-ice');
  if (!diffNode) {
    console.log(`No compute-diff node found in ${filePath}`);
    return;
  }

  let code = diffNode.parameters.jsCode;
  const before = (code.match(/sendUpdates/g) || []).length;

  // === Template literal style (calendar-sync.json) ===
  // POST URLs: /events`  ->  /events?sendUpdates=none`
  code = code.replace(/\/events`/g, '/events?sendUpdates=none`');
  // PATCH/DELETE URLs: /events/${existing.id}`  ->  /events/${existing.id}?sendUpdates=none`
  code = code.replace(/\/events\/(\$\{[^}]+\})`/g, '/events/$1?sendUpdates=none`');

  // === String concatenation style (calendar-sync-iceberg.json) ===
  // PATCH/DELETE: '/events/' + existing.id  ->  '/events/' + existing.id + '?sendUpdates=none'
  code = code.replace(
    /\/events\/' \+ (existing\.id|syncedEvent\.id),/g,
    "/events/' + $1 + '?sendUpdates=none',"
  );
  // POST: '/events',  ->  '/events?sendUpdates=none',
  // Need to match the specific pattern where /events' is followed by comma in the URL assignment
  code = code.replace(
    /\/events',\s*\n(\s*body:)/g,
    "/events?sendUpdates=none',\n$1"
  );

  diffNode.parameters.jsCode = code;
  fs.writeFileSync(filePath, JSON.stringify(wf, null, 2), 'utf8');

  // Verify
  const verify = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const verifyNode = verify.nodes.find(n => n.id === 'compute-diff' || n.id === 'compute-diff-ice');
  const verifyCode = verifyNode.parameters.jsCode;
  const count = (verifyCode.match(/sendUpdates=none/g) || []).length;
  console.log(`${path.basename(filePath)}: ${count} sendUpdates=none occurrences (was ${before})`);

  // Check for any remaining unfixed URLs
  const unfixed = verifyCode.match(/googleapis\.com\/calendar\/v3\/calendars\/[^'`]*\/events[^?'`\n]*[`',]/g) || [];
  const unfixedWithout = unfixed.filter(u => !u.includes('sendUpdates'));
  if (unfixedWithout.length > 0) {
    console.log(`  WARNING: ${unfixedWithout.length} URLs may still be missing sendUpdates:`);
    unfixedWithout.forEach(u => console.log(`    ${u}`));
  }
}

const base = path.join(__dirname, '..', 'n8n-workflows', 'shared');
fixCalendarSync(path.join(base, 'calendar-sync.json'));
fixCalendarSync(path.join(base, 'calendar-sync-iceberg.json'));
