Open Permits Item Prover
========================

An HTML+JS app for scanning Merkle tree items from a QR code and verifying that the scanned data is legitimate, with examples.

## Background

For a background on Merkle trees, Registers and this repository, see [Simon's blog post](https://registers.blog/2018/09/13/open-permits-and-the-power-of-open-source.html) about open permits.

Items from a demo [register](https://registers.app) of "broadband engineers" have been extracted with metadata about their position in the Merkle tree and an audit path allowing the root hash to be reconstructed. The extracts (in JSON form) have been encoded into QR codes.

When the app reads a QR code, it parses the JSON, hashes the item data, and uses the audit path to reconstruct the root hash of the register. It then compares this against the known root hash and dispalys a verification result.

Note that the app doesn't need the full list of "broadband engineers" to check against – this list is not even in this repository.

## Usage

To use the demonstration examples,

1. Serve this folder with your webserver of choice and navigate to [`/index.html`](./index.html).
2. Give permission for the app to use your camera and then show one of the QR codes from [`examples/`](./examples/).
3. When it scans successfully, the item will be displayed and verification status shown.

If you want to scan items from your own register, write the root hash into the `rootHashes` structure in [`index.html`](./index.html) and encode the items you want to scan as free-text QR codes.

## TODOs

0. QR codes are currently quite (physically) large; use a more compact item representation than JSON.
1. Start using permanent browser storage to store history.
2. Start using Service Workers to allow offline access.
3. Provide a mechanism for root hashes to be downloaded and remembered.
4. Support for iOS devices.
5. I believe the scanner could be better at recognition – investigate this (e.g. convert ZXing to WebASM?).