export function toPascalCase(input) {
    return input
        .replace(/\[|\]/g, "") // remove dynamic route brackets
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\s+/g, "");
}
export function toKebabCase(input) {
    return input
        .replace(/\[|\]/g, "")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[-_]/g, "-")
        .toLowerCase()
        .replace(/^-|-$/g, "");
}
export function toFilePath(input) {
    return input.replace(/\[|\]/g, "");
}
export function toClassName(input) {
    return toPascalCase(input) + "Page";
}
//# sourceMappingURL=naming.js.map