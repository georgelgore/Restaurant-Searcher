# Restaurant-Searcher
A take home assessment designed for Full-stack or Backend developers
## Best matched restaurants
### Introduction
I have completed this project using JS.

To run this project:
- install the necessary packages to run the script using: `npm install`. To verify, you should see a `node_modules` file generated.
- To see the output for the example cases, run the script file by entering `node index.js` in the terminal, you should see several console tables generated.
- To test manually your self, navigate to `index.js` and manipulate the entries in the `runExamples` function.

example output: 
https://share.getcloudapp.com/8Lukpvkz
https://share.getcloudapp.com/BluYdnY8

Assumptions:
- We want to prioritize matching restaurant names by the beginning of their strings. So for example if a customer enters just the letter "M",
  we want to find restaurants beginning with "M" (instead of any restaurant containing "M").
- It is ok to convert this csv to files more easily read and manipulated in js.
- node version is unimportant.
- We are not allowed to modify data shape in the csv.
- It is ok to have the fn argument be an object instead of several argument.
