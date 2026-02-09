export function isAdmin(groups: string | undefined): boolean {
    if (!groups) return false;
    let parsedGroups: string[] = [];
    try {
        parsedGroups = JSON.parse(groups);
    } catch (e) {
        console.error("Failed to parse groups:", e);
        return false;
    }
    return parsedGroups.includes('admin');
}