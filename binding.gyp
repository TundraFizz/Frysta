{
  "targets": [{
    "target_name": "screen-capture",
    "include_dirs" : [
      "src",
      "<!(node -e \"require('nan')\")"
    ],
    "sources": [
      "src/cpp/screen-capture.cpp"
    ]
  }]
}
