export default function slugify(str="", separator = "-") {
  return str
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading/trailing whitespace
    .normalize("NFD") // Split an accented letter into the base letter and the accent
    .replace(/[\u0300-\u036f]/g, "") // Remove all previously split accents
    .replace(/[^a-z0-9 -]/g, "") // Remove all chars not letters, numbers, and spaces/hyphens
    .replace(/\s+/g, separator) // Replace spaces with the separator
    .replace(/-+/g, separator) // Replace multiple separators with a single one
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing separators
}