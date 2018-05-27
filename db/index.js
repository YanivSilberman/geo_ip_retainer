import getStack from './getStack';
import batchUpdate from './batchUpdate';
import getExpired from './getExpired';
import insertStack from './insertStack';
import putStack from './putStack';

import db from './config';

export default callbacks => ({
  getStack: getStack(db, ...callbacks),
  batchUpdate: batchUpdate(db, ...callbacks),
  getExpired: getExpired(db, ...callbacks),
  insertStack: insertStack(db, ...callbacks),
  putStack: putStack(db, ...callbacks)
});
