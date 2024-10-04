const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const packageManager = detectPackageManager()
const init_cwd = process.env.INIT_CWD

// If the init cwd is not defined, something is wrong
// and install could not be done
if (!init_cwd) {
  throw new Error('INIT_CWD is not defined')
}

if (process.argv[2] === 'child') {
  // Add a delay to be sure pnpm or any other package manager
  // is done with its job about the package.json and we can 
  // safely rewrite it
  setTimeout(() => {
    // Get the package.json and the patched dependencies
    const packageJson = getPackageJson(init_cwd)
    // Get the patched dependencies from the fetched package.json
    const patchedDependencies = getPatchedDependencies(packageJson, packageManager)
    // Get the new patched dependencies from the process.argv comming from the parent process
    const newPatchedDependencies = JSON.parse(process.argv[3] || '{}')

    // Merge the new patched dependencies with the old ones
    setPatchedDependencies(packageJson, packageManager, {
      ...patchedDependencies,
      ...newPatchedDependencies
    })

    // Rewrite the package.json
    fs.writeFileSync(`${init_cwd}/package.json`, JSON.stringify(packageJson, null, 2), 'utf-8')

    // Once the package.json is updated, we can exit the child process
    // just in case
    process.exit(0)
  }, 500)


} else {
  // db that contains every patch references
  // a file is related to a specific package version or a package name
  const PATCH = {
    'next@14.2.13': 'patches/next@14.2.13.patch',
    'next@14.2.14': 'patches/next@14.2.14.patch'
  }

  const cwd = process.cwd()

  let missingPatches = {}
  let patchedDependencies = {}

  // For now we don't patch npm packages
  // because the pnpm, bun patch format is not compatible with npm for now
  if (packageManager === 'npm') {
    return
  }

  // In case of a monorepo, we need to fetch every package.json recursively
  const scannedPackages = getScannedPackages(init_cwd)


  // Loop over the patch object and check if the package is already patched
  // if not, we apply the patch in the current directory where statye will be installed
  // and update the package.json with the new patch
  for (const [name, patch] of Object.entries(PATCH)) {

    const [packageName, patchVersion] = name.split('@')
    const currentPackageJson = scannedPackages.find((packageJson) => (packageJson?.dependencies || {})[packageName])

    // If the package is not installed on every project, we skip it
    // No need to patch
    // or the package is already patched
    if (!currentPackageJson) {
      continue
    }

    // If the package is installed but the version is not supported
    // it's mean there is no patch for this version
    if (currentPackageJson?.dependencies?.[packageName] !== patchVersion) {

      const currentVersion = currentPackageJson.dependencies[packageName]
      const patchedKey = packageName + '@' + currentVersion

      // If the package is already patched, we don't need to patch it again
      // even if there an other patch for an other version
      // so skip missing patches phase
      if (patchedDependencies[patchedKey]) {
        continue
      }

      missingPatches[packageName] = currentVersion
      continue
    }


    // If there is a patch for this package, reset the missing patch object
    delete missingPatches[packageName]

    if (packageManager !== 'npm') {
      patchedDependencies[name] = patch
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
  // Update the file in a detached process to avoid pnpm rewriting package.json
  if (Object.keys(patchedDependencies).length > 0) {
    const args = [
      `${__filename}`,
      'child',
      JSON.stringify(patchedDependencies)
    ]
    const child = spawn('node', args, { detached: true })

    // unlink the child event loop from the main event loop
    child.unref()

    // By leaving the main process, child can leave alone and do its job
    // in a separate process
    process.exit(0)
  }

  function getScannedPackages(path) {
    const packages = searchFiles(path, 'package.json')
    return packages.map((packageJson) => {
      const packageJsonContent = fs.readFileSync(packageJson, 'utf-8')
      const packageJsonObject = JSON.parse(packageJsonContent)
      return packageJsonObject
    })
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


function getPackageJson(path) {
  return JSON.parse(fs.readFileSync(`${path}/package.json`, 'utf-8'))
}
