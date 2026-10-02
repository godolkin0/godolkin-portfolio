import fs from 'fs';
let s=fs.readFileSync('template.html','utf8');
s=s.replace(/\{\{([a-z-]+)\}\}/g,(m,n)=>fs.readFileSync(`node_modules/lucide-static/icons/${n}.svg`,'utf8').replace(/<!--.*?-->/s,'').trim());
fs.writeFileSync('index.html',s);
