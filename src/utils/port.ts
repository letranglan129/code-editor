export const findPortDockerfile = (content: string) => {
    const portExposeRegex = /EXPOSE\s+(\d+)(?::(\d+))?(?:\/(\w+))?/g
    let match
    const exposedPorts = []

    while ((match = portExposeRegex.exec(content)) !== null) {
        const startPort = match[1]
        const endPort = match[2] || startPort // Use startPort if don't have endPort
        exposedPorts.push(endPort)
    }

    return exposedPorts
}