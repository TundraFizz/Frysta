{
  "targets": [{
    "target_name": "myModule",
    "include_dirs" : [
      "src",
      "<!(node -e \"require('nan')\")"
    ],
    "sources": [
      "src/index.cpp",
      "src/MyAsyncBinding.cpp"
    ]
  }]
}
