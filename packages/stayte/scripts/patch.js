const fs = require('fs')
const path = require('path')

const init_cwd = process.env.INIT_CWD
const cwd = process.cwd()

// db that contains every patch references
// a file is related to a specific package version or a package name
const PATCH = {
  'next@14.2.13': 'patches/next@14.2.13.patch',
  'next@14.2.14': 'patches/next@14.2.14.patch'
}

// If the init cwd is not defined, something is wrong
// and install could not be done
if (!init_cwd) {
  throw new Error('INIT_CWD is not defined')
}

let missingPatches = {}
const rootPackageJson = getPackageJson(init_cwd)
const packageManager = detectPackageManager()

// For now we don't patch npm packages
// because the pnpm, bun patch format is not compatible with npm for now
if (packageManager === 'npm') {
  return
}

const initialPatchedDependenciesCount = Object.keys(getPatchedDependencies(rootPackageJson, packageManager)).length

// In case of a monorepo, we need to fetch every package.json recursively
const scannedPackages = getScannedPackages()

// If there is no patched dependencies, we create it in the package.json
// No need to add patcehdDependencies for npm because it's useless
if (packageManager !== 'npm' && initialPatchedDependenciesCount === 0) {
  setPatchedDependencies(rootPackageJson, packageManager, {})
}

// Loop over the patch object and check if the package is already patched
// if not, we apply the patch in the current directory where statye will be installed
// and update the package.json with the new patch
for (const [name, patch] of Object.entries(PATCH)) {

  const [packageName, patchVersion] = name.split('@')
  const currentPackageJson = scannedPackages.find((packageJson) => (packageJson?.dependencies || {})[packageName])

  // If the package is not installed on every project, we skip it
  // No need to patch
  if (!currentPackageJson) {
    continue
  }

  // If the package is installed but the version is not supported
  // it's mean there is no patch for this version
  if (currentPackageJson?.dependencies?.[packageName] !== patchVersion) {
    missingPatches[packageName] = currentPackageJson.dependencies[packageName]
    continue
  }

  // If there is a patch for this package, reset the missing patch object
  delete missingPatches[packageName]

  if (packageManager !== 'npm' && !getPatchedDependencies(rootPackageJson, packageManager)[name]) {
    setPatchedDependencies(rootPackageJson, packageManager, {
      ...getPatchedDependencies(rootPackageJson, packageManager),
      [name]: patch
    })
  }

  // Changing the patch name for npm because "patch-package"
  // don't support the "@" character in patch name
  const newPatchName = packageManager === 'npm'
    ? patch.replace('@', '+')
    : patch

  const newPatchPath = `${init_cwd}/${newPatchName}`

  // Mount the patch directory if it doesn't exist
  if (!fs.existsSync(`${init_cwd}/patches`)) {
    fs.mkdirSync(`${init_cwd}/patches`)
  }

  // If the patch doesn't exist, we create it
  if (!fs.existsSync(newPatchPath)) {
    const patchContent = fs.readFileSync(`${cwd}/${patch}`, 'utf-8')
    fs.writeFileSync(newPatchPath, patchContent, 'utf-8')
  }
}

// Raise an error if there is no patch for some dependencies
// that is required to be patched
if (Object.keys(missingPatches).length > 0) {
  const message = `
    Could not install stayte because some dependencies as the wrong version
    ${Object.entries(missingPatches).map(([packageName, version]) => ` - ${packageName}@${version} founded`).join('\n')}

    Please read the documentation to know how to fix this issue
    https://stayte.vercel.app/docs/installation
  `
  throw new Error(message)
}

// We only write the package.json if the number of patched dependencies has changed
// this is to avoid unnecessary writes
const newPatchedDependenciesCount = Object.keys(getPatchedDependencies(rootPackageJson, packageManager)).length
if (newPatchedDependenciesCount > initialPatchedDependenciesCount) {
  fs.writeFileSync(`${init_cwd}/package.json`, JSON.stringify(rootPackageJson, null, 2), 'utf-8')
}


function getPatchedDependencies(packageJson, packageManager) {
  if (packageManager === 'npm') {
    return {}
  }
  if (packageManager === 'bun') {
    return packageJson?.patchedDependencies || {}
  }
  if (packageManager === 'pnpm') {
    return packageJson?.pnpm?.patchedDependencies || {}
  }
}


function setPatchedDependencies(packageJson, packageManager, patchedDependencies) {
  if (packageManager === 'bun') {
    packageJson.patchedDependencies = patchedDependencies
  } else if (packageManager === 'pnpm') {
    if (!packageJson.pnpm) {
      packageJson.pnpm = {}
    }
    packageJson.pnpm.patchedDependencies = patchedDependencies
  }
}

function getScannedPackages() {
  const packages = searchFiles(init_cwd, 'package.json')
  return packages.map((packageJson) => {
    const packageJsonContent = fs.readFileSync(packageJson, 'utf-8')
    const packageJsonObject = JSON.parse(packageJsonContent)
    return packageJsonObject
  })
}

function getPackageJson(path) {
  return JSON.parse(fs.readFileSync(`${path}/package.json`, 'utf-8'))
}

function detectPackageManager() {
  const npmAgent = process?.env?.npm_config_user_agent || ''
  const allowedPackageManagers = ['npm', 'bun', 'yarn', 'pnpm']
  const packageManager = npmAgent.split('/')[0]
  if (!allowedPackageManagers.includes(packageManager)) {
    throw new Error('Cannot detect package manager')
  }
  return packageManager
}


function searchFiles(dir, fileName) {
  let foundedFiles = []
  try {
    // read the contents of the directory
    const files = fs.readdirSync(dir)

    // search through the files
    for (const file of files) {
      // build the full path of the file
      const filePath = path.join(dir, file);
      // get the file stats
      const fileStat = fs.statSync(filePath);

      // if the file is a directory, recursively search the directory
      if (fileStat.isDirectory() && !file.match(/node_modules|.git|.turbo|\./)) {
        foundedFiles.push(...searchFiles(filePath, fileName))
      } else if (file.endsWith(fileName)) {
        foundedFiles.push(filePath);
      }
    }
  } catch (err) {
    console.error(err);
  }
  return foundedFiles;
}