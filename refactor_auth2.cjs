const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (content.includes('db.auth.me(')) {
    // 1. Add import import { useAuth } from '@/lib/AuthContext';
    if (!content.includes('useAuth') && !content.includes('@/lib/AuthContext')) {
      content = content.replace(/(import .*?;?\n)/, "$1import { useAuth } from '@/lib/AuthContext';\n");
    } else if (!content.includes('useAuth') && content.includes('@/lib/AuthContext')) {
      content = content.replace(/import\s+\{(.*?)\}\s+from\s+['"]@\/lib\/AuthContext['"]/g, (match, imports) => {
        if (!imports.includes('useAuth')) {
          return `import { ${imports.trim()}, useAuth } from '@/lib/AuthContext'`;
        }
        return match;
      });
    }

    // 2. Replace const [user, setUser] = useState(null) with const { user } = useAuth()
    content = content.replace(/const\s+\[(user|currentUser),\s*(setUser|setCurrentUser)\]\s*=\s*useState\(null\);/g, (match, stateName) => {
      if (stateName === 'currentUser') {
        return 'const { user: currentUser } = useAuth();';
      }
      return 'const { user } = useAuth();';
    });

    // 3. Simple one-liner useEffect
    content = content.replace(/^\s*useEffect\(\(\) => \{\s*db\.auth\.me\(\)\.then\([^)]+\)\.catch\([^)]*\);\s*\},?\s*\[\]\);\s*$/gm, '');
    content = content.replace(/^\s*useEffect\(\(\) => \{\s*db\.auth\.me\(\)\.then\([^)]+\);\s*\},?\s*\[\]\);\s*$/gm, '');

    // 4. Standalone db.auth.me().then(setUser).catch(...)
    content = content.replace(/^\s*db\.auth\.me\(\)\.then\((setUser|setCurrentUser)\).*?;?\s*$/gm, '');

    // 5. db.auth.me().then(async u => { ... }) pattern inside useEffect
    // We can't safely use regex for complex AST replacements, but since we already replaced the useState(null) with useAuth(), the component already has `user`. 
    // We can replace `db.auth.me().then(async u => {` with `if (user) { let u = user;`
    // OR we can just ignore for now and see what breaks, but let's try a safe generic replace:
    content = content.replace(/db\.auth\.me\(\)\.then\(\s*(async\s+)?([a-zA-Z0-9_]+)\s*=>\s*\{/g, 'if (user) { let $2 = user;');
    // and replace `.catch(() => db.auth.redirectToLogin());` with nothing if it was attached.
    content = content.replace(/\}\)\.catch\(\(\)\s*=>\s*db\.auth\.redirectToLogin\(\)\);/g, '}');
    content = content.replace(/\}\)\.catch\(\(\)\s*=>\s*\{\}\);/g, '}');

    // Also remove the db.auth.me().then(u => setUser(u)) if it exists
    content = content.replace(/db\.auth\.me\(\)\.then\(([u])\s*=>\s*\{\s*setUser\(\1\);/g, 'if (user) {');
    
    // Also Analytics.jsx has db.auth.me().then(setUser).catch(() => {
    content = content.replace(/db\.auth\.me\(\)\.then\((setUser|setCurrentUser)\)\.catch\(\(\)\s*=>\s*\{/g, 'if (!user) {');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Refactored:', file);
    }
  }
});
