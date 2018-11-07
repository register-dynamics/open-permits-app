// merkle-tree.js - tools for dealing with Merkle tree audit paths
// See https://tools.ietf.org/html/rfc6962
//
// Copyright (c) Simon Worthington, Register Dynamics Ltd.
// All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software
// and associated documentation files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Perform the hash of two sides of a Merkle tree.
var hashInternal = function(left, right) {
  var hash = new sjcl.hash.sha256();
  hash.update("\x01");
  hash.update(left);
  hash.update(right);
  return hash.finalize();
}

// Perform the hash of an item.
var hashLeaf = function(leaf) {
  var hash = new sjcl.hash.sha256();
  hash.update("\x00");
  hash.update(leaf);
  return hash.finalize();
}

// Convert web-safe base64 to regular base64.
var webBase64ToBits = function(e) {
  return sjcl.codec.base64.toBits(e.replace(/_/g, "\/").replace(/-/g, "+"));
}

// Returns true if the root hash computed from the item and path
// match the root hash supplied.
var isProved = function(item, entryNumber, treeSize, path, root) {
  return sjcl.codec.base64.fromBits(merkleRoot(item, entryNumber, treeSize, path)) == sjcl.codec.base64.fromBits(root);
}

// Computes the root hash of a Merkle tree from an item
// and it's associated audit path elements
var merkleRoot = function(item, entryNumber, treeSize, path) {
  path.unshift(hashLeaf(item));
  var root = merklePath(entryNumber, treeSize, path);
  return root;
}

// MTH(D[n]) = SHA-256(0x01 || MTH(D[0:k]) || MTH(D[k:n]))
// PATH(m, D[n]) = PATH(m, D[0:k]) : MTH(D[k:n]) for m < k; and
// PATH(m, D[n]) = PATH(m - k, D[k:n]) : MTH(D[0:k]) for m >= k,
// so for m < k, we have right hash, for m >= k we have left hash
var merklePath = function(m, n, hashes) {
  var hashForThisLevel = hashes.pop(); //mutates
  if (n == 1) return hashForThisLevel;
  var k = 2 ** Math.floor(Math.log2(n-1));
  if (m < k) {
    var subHash = merklePath(m, k, hashes);
    return hashInternal(subHash, hashForThisLevel);
  } else {
    var subHash = merklePath(m - k, n - k, hashes);
    return hashInternal(hashForThisLevel, subHash);
  }
}
