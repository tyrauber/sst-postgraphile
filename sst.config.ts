import { SSTConfig } from "sst";
import { Network } from "./stacks/Network";
import { Database } from "./stacks/Database";
import { API } from "./stacks/Api";

export default {
  config(_input) {
    return {
      name: "sst-postgraphile",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app
      .stack(Network)
      .stack(Database)
      .stack(API);
  }
} satisfies SSTConfig;
