module.exports = {
  // ... existing code ...
  module: {
    rules: [
      // ... existing rules ...
      {
        test: /\.txt$/,
        type: 'asset/source'
      }
    ]
  }
  // ... existing code ...
}; 