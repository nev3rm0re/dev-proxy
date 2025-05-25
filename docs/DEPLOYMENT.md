# GitHub Pages Deployment Guide

This guide will help you deploy the dev-proxy documentation to GitHub Pages.

## Quick Setup (Recommended)

### Step 1: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **GitHub Actions**

### Step 2: Update Configuration
1. Edit `docs/_config.yml` and update these values:
   ```yaml
   baseurl: "/your-repo-name"  # Replace with your actual repo name
   url: "https://your-username.github.io"  # Replace with your GitHub username
   ```

### Step 3: Commit and Push
```bash
git add .
git commit -m "Add GitHub Pages documentation"
git push origin main
```

### Step 4: Access Your Documentation
After the GitHub Action completes (2-3 minutes), your documentation will be available at:
```
https://your-username.github.io/your-repo-name/
```

## Manual Setup (Alternative)

If you prefer not to use GitHub Actions:

### Step 1: Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch and **/ (root)** folder
4. Click **Save**

### Step 2: Move Documentation
```bash
# Move docs to root for GitHub Pages
mv docs/* .
mv docs/_config.yml .
rmdir docs
```

### Step 3: Update Paths
Update `_config.yml`:
```yaml
baseurl: "/your-repo-name"
url: "https://your-username.github.io"
```

## Customization Options

### Theme Customization
You can customize the appearance by:

1. **Using a different theme**: Edit `_config.yml`
   ```yaml
   theme: jekyll-theme-cayman  # or other themes
   ```

2. **Custom CSS**: Create `assets/css/style.scss`
   ```scss
   @import "{{ site.theme }}";
   
   // Your custom styles here
   ```

### Navigation Menu
Edit the `header_pages` in `_config.yml` to control navigation:
```yaml
header_pages:
  - README.md
  - rules-api.md
  - use-cases.md
  - getting-started.md  # Add more pages
```

## Troubleshooting

### Common Issues

1. **404 Error**: Check that `baseurl` matches your repository name
2. **Styling Issues**: Ensure `_config.yml` is in the correct location
3. **Build Failures**: Check the Actions tab for error details

### GitHub Actions Logs
1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Check logs for any errors

### Local Testing
To test locally before deploying:
```bash
# Install Jekyll
gem install bundler jekyll

# Navigate to docs directory
cd docs

# Create Gemfile
echo 'source "https://rubygems.org"' > Gemfile
echo 'gem "github-pages", group: :jekyll_plugins' >> Gemfile

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Visit http://localhost:4000
```

## Advanced Configuration

### Custom Domain
If you have a custom domain:

1. Create `docs/CNAME` file:
   ```
   your-domain.com
   ```

2. Update `_config.yml`:
   ```yaml
   url: "https://your-domain.com"
   baseurl: ""
   ```

### SEO Optimization
Add to `_config.yml`:
```yaml
plugins:
  - jekyll-seo-tag

# SEO settings
author: Your Name
twitter:
  username: your_twitter
  card: summary
social:
  name: Your Name
  links:
    - https://github.com/your-username
```

## File Structure

After setup, your repository should look like:
```
your-repo/
├── .github/
│   └── workflows/
│       └── docs.yml
├── docs/
│   ├── _config.yml
│   ├── README.md
│   ├── rules-api.md
│   ├── use-cases.md
│   └── DEPLOYMENT.md (this file)
├── packages/
│   ├── client/
│   ├── server/
│   └── types/
└── ... (other project files)
```

## Next Steps

1. **Add more documentation**: Create additional `.md` files in the `docs/` folder
2. **Improve styling**: Customize the theme or add custom CSS
3. **Add search**: Consider adding a search plugin for better navigation
4. **Analytics**: Add Google Analytics or other tracking if needed

Your documentation will automatically update whenever you push changes to the `docs/` folder! 