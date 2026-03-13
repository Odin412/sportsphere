const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (content.includes('db.auth.me()')) {
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

    // 3. Remove basic one-liner useEffect that just fetches the user
    content = content.replace(/^\s*useEffect\(\(\) => \{\s*db\.auth\.me\(\)\.then\([^)]+\)\.catch\([^)]*\);\s*\},?\s*\[\]\);\s*$/gm, '');
    content = content.replace(/^\s*useEffect\(\(\) => \{\s*db\.auth\.me\(\)\.then\([^)]+\);\s*\},?\s*\[\]\);\s*$/gm, '');

    // 4. Remove standalone db.auth.me() inside useEffect or as a line if it matches the then/catch simple form
    // Matches: db.auth.me().then(setUser).catch(() => {});
    content = content.replace(/^\s*db\.auth\.me\(\)\.then\((setUser|setCurrentUser)\).*?;?\s*$/gm, '');

    // 5. Handle async blocks in useEffect that fetch the user and then do something else
    // e.g.
    // db.auth.me().then(async u => {
    //   setUser(u);
    //   ...
    // })
    // We can replace the `db.auth.me().then(async u => {` with `if (u) {` (where u is user/currentUser)
    // Wait, if it's inside `useEffect(() => { ... }, [])`, and it relied on fetching `u` then it needs to depend on `user` instead!
    // So this script will just attempt the simple replacements first to see how much it clears up.

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Refactored:', file);
    }
  }
});
