const fs = require('fs');
const path = require('path');

const version = process.env.RELEASE_VERSION;
const tag = process.env.RELEASE_TAG || `v${version}`;
const repo = process.env.GITHUB_REPOSITORY || 'geekotaku/xflow';
const owner = repo.split('/')[0];

if (!version) {
  console.error('RELEASE_VERSION environment variable is required');
  process.exit(1);
}

let notes = '';
try {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const escapedVersion = version.replace(/\./g, '\\.');
    const regex = new RegExp(`## \\\[?${escapedVersion}\\\]?[^\\n]*\\n([\\s\\S]*?)(?=(?:\\n## |$))`);
    const match = changelog.match(regex);
    if (match) {
      notes = match[1].trim();
    }
  }
} catch (err) {
  console.warn('Failed to parse CHANGELOG.md:', err.message);
}

if (!notes) {
  notes = `Release ${tag}`;
}

const body = `## xflow ${tag}

${notes}

---

### 📦 Docker Images (GitHub Container Registry)
- **xflow Server**: \`ghcr.io/${repo}:${version}\`
- **xflow-agent**: \`ghcr.io/${owner}/xflow-agent:${version}\`

### 🚀 One-Click Installers
- **Server**: \`sudo bash <(curl -fsSL https://raw.githubusercontent.com/${repo}/main/install.sh)\`
- **Agent**: \`sudo bash <(curl -fsSL https://raw.githubusercontent.com/${repo}/main/install-agent.sh)\`

### ⚡ Standalone Agent Binaries
Prebuilt standalone executables with zero runtime dependencies are attached below (\`xflow-agent-linux-amd64\`, \`xflow-agent-linux-arm64\`).
`;

fs.writeFileSync('RELEASE_BODY.md', body, 'utf8');
console.log('Successfully generated RELEASE_BODY.md for version ' + version);
