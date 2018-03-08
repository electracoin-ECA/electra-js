/**
 * This task is a dirty hack to fix an ununderstandable TS typings generation bug.
*/

const fs = require('fs')

// Copy src/types.ts to dist/types.d.ts
const source = fs.readFileSync('src/types.ts', 'UTF-8')
fs.writeFileSync('dist/types.d.ts', source, 'UTF-8')
