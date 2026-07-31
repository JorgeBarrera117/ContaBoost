const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('C:\\Users\\PC_1\\Desktop\\ContaBoost\\backend\\src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match ` as camelCase` or ` AS camelCase` but NOT `as any` or `as string`
  // We only want aliases in SQL queries. Typically they are inside backticks or quotes, 
  // but to be safe we can just match ` as \w*[A-Z]\w*` which matches camelCase words.
  const regex = /\b(as|AS)\s+([a-z]+[A-Z]\w*)\b/g;
  
  if (regex.test(content)) {
    const newContent = content.replace(regex, '$1 "$2"');
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Fixed aliases in ${changed} files.`);
