import { fund } from '../../../src/fund/fund';
import { forceWebfundingOnBrowser } from '../../../src/fund/fund-browser';
import {getPaymentPointerSharePercentage} from '../../../src/fund/stats'

describe('Calculating stats is correct',  ()=> {
  it('show weight percentage', ()=>{
    const pointers = [
      {
        address: "$coil.com/pointer-test",
        weight: 5,
      },
      {
        address: "$coil.com/pointer-test2",
        weight: 15,
      },
      {
        address: "$coil.com/pointer-test2",
        weight: 30,
      },
    ];

    forceWebfundingOnBrowser();
    fund(pointers)

    expect(getPaymentPointerSharePercentage('$coil.com/pointer-test')).toBe(0.1)
  })
})