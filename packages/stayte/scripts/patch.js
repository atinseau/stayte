const fs = require('fs')

const init_cwd = process.env.INIT_CWD
const cwd = process.cwd()

// db that contains every patch references
// a file is related to a specific package version or a package name
const PATCH = {
  'next@14.2.13': 'patches/next@14.2.13.patch'
}

// If the init cwd is not defined, something is wrong
// and install could not be done
if (!init_cwd) {
  throw new Error('INIT_CWD is not defined')
}

const packageJson = JSON.parse(fs.readFileSync(`${init_cwd}/package.json`, 'utf-8'))

// If there is no patched dependencies, we create it in the package.json
if (!packageJson.patchedDependencies) {
  packageJson.patchedDependencies = {}
}

// Loop over the patch object and check if the package is already patched
// if not, we apply the patch in the current directory where statye will be installed
// and update the package.json with the new patch
for (const [name, patch] of Object.entries(PATCH)) {

  if (!packageJson.patchedDependencies[name]) {
    const patchPath = `${cwd}/${patch}`
    const patchContent = fs.readFileSync(patchPath, 'utf-8')
    if (!fs.existsSync(`${init_cwd}/patches`)) {
      fs.mkdirSync(`${init_cwd}/patches`)
    }

    fs.writeFileSync(`${init_cwd}/${patch}`, patchContent, 'utf-8')
    packageJson.patchedDependencies[name] = patch
  }
}

fs.writeFileSync(`${init_cwd}/package.json`, JSON.stringify(packageJson, null, 2), 'utf-8')