var showProof = function(proofJson) {
  var itemJson = getItemFromProof(proofJson);
  document.getElementById("title").innerText = proofJson.register.name;
  document.getElementById('data').innerHTML = "";
  for (var property in itemJson) {
    var field = document.createElement("div");
    var title = document.createElement("h2");
    title.innerText = property;
    var value = document.createElement("span");
    value.innerText = itemJson[property];
    field.appendChild(title);
    field.appendChild(value);
    document.getElementById('data').appendChild(field);
  }
  document.getElementById("results").classList.add("shown");
}

var showVerification = function(verified) {
  var box = document.getElementById("proof");
  box.classList.remove("verified-true");
  box.classList.remove("verified-false");
  box.classList.add("verified-" + verified);
}

var getItemFromProof = function(proofJson) {
  return JSON.parse(/{.+}/.exec(proofJson.entry)[0]);
}

// TODO: mechanism for permanently storing scan history
// this is just the DOM and hence will disappear upon refresh
// instead we should store history in a more long-lived browser store
var scanHistory = [];

var process = function(data) {
  try {
    var proofJson = JSON.parse(data);
    if (!proofJson.hasOwnProperty('audit')) throw TypeError;
    if (!proofJson.hasOwnProperty('index')) throw TypeError;
    if (!proofJson.hasOwnProperty('register')) throw TypeError;
    if (!proofJson.hasOwnProperty('entry')) throw TypeError;
    if (!proofJson.register.hasOwnProperty('name')) throw TypeError;
    if (!proofJson.register.hasOwnProperty('size')) throw TypeError;
    stopScan();

    scanHistory.unshift({content: proofJson, when: new Date()});
    refreshHistory();
    showProof(proofJson);
    var rootHash = webBase64ToBits(rootHashes[proofJson.register.name]);
    // Registers have their entry numbers starting from 1 and not 0 so we need to -1 here
    var verified = isProved(proofJson.entry, proofJson.index-1, proofJson.register.size, proofJson.audit.map(webBase64ToBits), rootHash);
    showVerification(verified);
  } catch (e) {
    console.log("Not valid Registers item json!");
    console.log(e);
    continueScan();
    return;
  }
};

var refreshHistory = function() {
  var historyScene = document.querySelector("#history div");
  historyScene.innerHTML = "";

  for (var i in scanHistory) {
    var scan = document.createElement("div");
    var title = document.createElement("span");
    var register = scanHistory[i].content.register.name;
    var itemJson = getItemFromProof(scanHistory[i].content);
    title.innerText = register.charAt(0).toUpperCase() + register.slice(1) + ": " + itemJson[register];
    var when = document.createElement("h2");
    when.innerText = scanHistory[i].when.toLocaleDateString() + " " + scanHistory[i].when.toLocaleTimeString();
    scan.appendChild(when);
    scan.appendChild(title);
    historyScene.appendChild(scan);
  }
}

var startScan = function() {
  qrcode.callback = process;
  qrcode.setWebcam('scanner');
};

var continueScan = function () {
  qrcode.captureToCanvas();
};

var stopScan = function() {
  qrcode.video.srcObject.getVideoTracks()[0].stop();
};

var maybeScan = function() {
  if (window.location.hash == "#scanner" || window.location.hash == "") {
    startScan();
  } else {
    stopScan();
  }
};

window.addEventListener("load", maybeScan);
window.addEventListener("load", refreshHistory);
window.addEventListener("hashchange", maybeScan);

window.addEventListener("load", function() {
  document.getElementById("close").addEventListener("click", function() {
    document.getElementById("results").classList.remove("shown");
    startScan();
  });
});
