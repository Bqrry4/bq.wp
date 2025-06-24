/** 
  //@ Couldn't found a way to save the wasm file explicitly with wasmer/sdk
  //@ Fetches webc packages from wasmer via graphql api
*/

import { writeFile } from "@/core/filesystem/FileSystem";
import { Command } from "../commands";
import WasiBindings from "@/core/wasm/p1/WasiBindings";

const REGISTRY_URL = "https://registry.wapm.io/graphql";

const searchQuery = (pkg: string) => `{
    search(query: "${pkg}", packages: {}) {
      edges {
        node {
          ... on PackageVersion{
            package{
                name 
            }
          }
        }
      }
    }
  }`;

type SearchQueryResponse = {
    data: {
        search: {
            edges: {
                node: {
                    package: {
                        name: string;
                    }
                }
            }[]
        }
    }
};

const getPackageQuery = (pkg: string) => `{
    getPackage(name: "${pkg}") {
      lastVersion {
        webc {
          offsets
          webcUrl
        }
      }
    }
  }`;

type GetPackageQueryResponse = {
    data: {
        getPackage: {
            lastVersion: {
                webc: {
                    offsets: string;
                    webcUrl: string;
                }
            }
        }
    }
};

type WebcAtom = {
    contents: {
        span: {
            start: number,
            len: number
        }
        //...
    }[]
    //...
}

async function fetchWithQuery(query: string) {
    const respone = await fetch(REGISTRY_URL, {
        body: JSON.stringify({ query: `query ${query}` }),
        headers: { "content-type": "application/json" },
        method: "POST",
    });
    const body = await respone.json();

    return body;
}


async function installPackage(pkg: string) {
    const webc = (await fetchWithQuery(getPackageQuery(pkg)) as GetPackageQueryResponse)
        .data?.getPackage?.lastVersion?.webc;

    if (!webc) {
        console.log("No url");
    }
    //Got the package format
    const webcBin = new Uint8Array(await (await fetch(webc.webcUrl)).arrayBuffer());

    // Parse the wasm payload
    const offset: WebcAtom = JSON.parse(webc.offsets)
        .find((item: { type: string }) => item.type === "atom");

    //@ Assume there is only one wasm file in package.. for now
    const boundary = offset.contents[0].span;

    // Write to the fs
    // await writeFile(
    //   `/wapm/${pkg.split('/').pop()}`,
    //   webcBin.subarray(boundary.start, boundary.start + boundary.len)
    // );
    const bytes = webcBin.subarray(boundary.start, boundary.start + boundary.len);
    const mod = new WebAssembly.Module(bytes);

    const bindings = new WasiBindings();
    const memory = new WebAssembly.Memory({
        initial: 1,
    });

    const instance = new WebAssembly.Instance(mod, {
        js: { mem: memory },
        wasi_unstable: bindings.getWasi({
            args: [],
            memory: memory
        }).wasi_unstable
    });
    console.log(instance.exports);

}

function searchPackage(pkg: string) {
    fetchWithQuery(searchQuery(pkg))
        .then((value: SearchQueryResponse) => {
            value.data.search.edges.map((edge) => {
                console.log(edge.node.package.name);
            });
        });
}

export const wapm: Command = {
    desc: "Wasm package manager",
    execute: (args?: string[]) => {

        if (!args) return "Nothing to do";

        switch (args[0]) {
            case "search":
                searchPackage(args[1]);
                break;
            case "install":
                installPackage(args[1]);
                break;
        }

        return '';
    }
}