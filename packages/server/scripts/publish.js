import prompts from 'prompts';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

async function publish() {
  try {
    // Ensure we're on main/master branch
    const currentBranch = execSync('git branch --show-current').toString().trim();
    if (!['main', 'master'].includes(currentBranch)) {
      console.error('❌ Please switch to main/master branch before publishing');
      process.exit(1);
    }

    // Ensure working directory is clean
    try {
      execSync('git diff --quiet HEAD');
    } catch {
      console.error('❌ Working directory is not clean. Please commit changes first.');
      process.exit(1);
    }

    // Get current version
    const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
    const currentVersion = pkg.version;

    // Prompt for version bump type
    const response = await prompts({
      type: 'select',
      name: 'bump',
      message: `Current version is ${currentVersion}. Select version bump type:`,
      choices: [
        { title: 'Patch (bug fixes)', value: 'patch' },
        { title: 'Minor (new features)', value: 'minor' },
        { title: 'Major (breaking changes)', value: 'major' },
        { title: 'Cancel', value: 'cancel' }
      ]
    });

    if (!response.bump || response.bump === 'cancel') {
      console.log('📦 Publishing cancelled');
      process.exit(0);
    }

    // Run build first
    console.log('🛠 Building...');
    execSync('yarn run build', { stdio: 'inherit' });

    // Bump version
    console.log('📝 Bumping version...');
    execSync(`yarn version --new-version ${response.bump}`);

    // Get new version
    const updatedPkg = JSON.parse(readFileSync('./package.json', 'utf8'));
    const newVersion = updatedPkg.version;

    // Confirm before publishing
    const confirmResponse = await prompts({
      type: 'confirm',
      name: 'value',
      message: `Ready to publish v${newVersion}. Continue?`,
      initial: true
    });

    if (!confirmResponse.value) {
      // Revert version bump
      writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
      console.log('📦 Publishing cancelled');
      process.exit(0);
    }

    // Publish
    console.log('📦 Publishing...');
    execSync('yarn publish --access public', { stdio: 'inherit' });

    // Create git commit and tag
    execSync(`git add package.json`);
    execSync(`git commit -m "chore: release v${newVersion}"`);
    execSync(`git tag v${newVersion}`);
    execSync('git push origin main --tags');

    console.log(`✅ Successfully published v${newVersion}!`);
  } catch (error) {
    console.error('❌ Error during publishing:', error.message);
    process.exit(1);
  }
}

publish();