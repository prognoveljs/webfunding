// import { fund, WebMonetization } from "../../../src/fund/mod";
// import { forceWebfundingOnBrowser } from "../../../src/fund/fund-browser";
// import { toBeInTheDocument, toHaveAttribute } from "@testing-library/jest-dom/matchers";
// expect.extend({ toBeInTheDocument, toHaveAttribute });

// describe("setup web monetzation class", () => {
//   it("start correctly", (done) => {
//     const pointers = [
//       "$wallet.com/example-1#20",
//       "$wallet.com/example-2#40",
//       "$wallet.com/example-3#10",
//     ];

//     forceWebfundingOnBrowser();
//     let wm;
//     try {
//       wm = new WebMonetization().registerPaymentPointers(pointers).start();
//     } catch (error) {
//       throw error;
//     }

//     wm.queue
//       .then(() => {
//         const metaTags = document.head.querySelectorAll('meta[name="monetization"]');
//         expect(metaTags[0]).toBeInTheDocument();
//         done();
//       })
//       .catch((err) => {
//         done(err);
//       });
//   });
// });
