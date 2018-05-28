// tslint:disable

import assertThen from './assertThen'
import closeElectraDaemons from './closeElectraDaemons'

describe('helpers/closeElectraDaemons()', function() {
  this.timeout(10000)

  it(`SHOULD NOT throw any error`, async () => await assertThen(() => closeElectraDaemons()))
})
