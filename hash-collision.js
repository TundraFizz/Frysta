var totalUniqueHashes = 57731386986;
var generatedHashes   = 100000;

var index = 0;
var result = 1;

while(index < generatedHashes){
  var odds = ((totalUniqueHashes-index)/totalUniqueHashes);
  result *= odds;
  index++;
}

console.log("========== Result ==========");
result = (1 - result) * 100 + "%";
console.log(result);

// Ideal probability is 0.01%

// 1  2    3      4        5         6
// 62+3844+238328+14776336+916132832+56800235584
// =57731386986
// 57,731,386,986
// 57 billion
// 100,000 hashes = 8.3% collision
