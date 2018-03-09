/**
 * This task is a dirty hack to fix an ununderstandable TS typings generation bug.
*/

const fs = require('fs')

// Copy src/types.ts to dist/types.d.ts
fs.writeFileSync('dist/types.d.ts', fs.readFileSync('src/types.ts', 'UTF-8'), 'UTF-8')

// Copy src/libs/rpc/types.ts to dist/libs/rpc/types.d.ts
fs.writeFileSync('dist/libs/rpc/types.d.ts', fs.readFileSync('src/libs/rpc/types.ts', 'UTF-8'), 'UTF-8')
