// See https://tools.ietf.org/html/rfc6962

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
