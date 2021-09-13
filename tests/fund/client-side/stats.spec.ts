import { fund } from "../../../src/fund/fund";
import { forceWebfundingOnBrowser } from "../../../src/fund/fund-browser";
import {
  createWebfundingLeaderboard,
  getPaymentPointerSharePercentage,
} from "../../../src/fund/stats";
import { getCurrentPointerPool } from "../../../src/fund/utils";

describe("Calculating stats is correct", () => {
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
      address: "$coil.com/pointer-test3",
      weight: 30,
    },
  ];

  const leaderboard = [
    {
      address: "$coil.com/pointer-test3",
      chance: 0.6,
    },
    {
      address: "$coil.com/pointer-test2",
      chance: 0.3,
    },
    {
      address: "$coil.com/pointer-test",
      chance: 0.1,
    },
  ];

  it("show weight percentage", () => {
    forceWebfundingOnBrowser();
    fund(pointers);

    expect(getPaymentPointerSharePercentage("$coil.com/pointer-test")).toBe(0.1);
  });

  it("show correct leaderboard", () => {
    forceWebfundingOnBrowser();
    fund(pointers);

    expect(createWebfundingLeaderboard()).toEqual(leaderboard);
  });

  const leaderboardRelativeWeight = [
    {
      address: "$coil.com/pointer-test3",
      chance: 0.54,
    },
    {
      address: "$coil.com/pointer-test2",
      chance: 0.27,
    },
    {
      address: "$coil.com/pointer-test-with-percentage",
      chance: 0.1,
    },
    {
      address: "$coil.com/pointer-test",
      chance: 0.09,
    },
  ];

  it("show correct leaderboard with relative weight", () => {
    forceWebfundingOnBrowser();
    fund([
      ...pointers,
      {
        address: "$coil.com/pointer-test-with-percentage",
        weight: "10%",
      },
    ]);

    expect(createWebfundingLeaderboard()).toEqual(leaderboardRelativeWeight);
  });

  it("show correct leaderboard with parameter", () => {
    forceWebfundingOnBrowser();
    fund([
      ...pointers,
      {
        address: "$coil.com/pointer-test-with-percentage",
        weight: "10%",
      },
    ]);

    const pool = getCurrentPointerPool();

    expect(createWebfundingLeaderboard(pool)).toEqual(leaderboardRelativeWeight);
  });

  it("leaderboard sort by descending", () => {
    forceWebfundingOnBrowser();
    fund(pointers);

    expect(createWebfundingLeaderboard()).toEqual(leaderboard);
  });

  it("leaderboard sort by ascending", () => {
    forceWebfundingOnBrowser();
    fund(pointers);

    expect(createWebfundingLeaderboard(undefined, { ascending: true })).toEqual(
      leaderboard.slice().reverse(),
    );
  });
});
