const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Get the input file path from command line arguments
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Please provide the path to the HTML file.");
  process.exit(1);
}

// Read and parse the HTML file
fs.readFile(path.resolve(inputPath), "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the HTML file:", err);
    process.exit(1);
  }

  const dom = new JSDOM(data);
  const document = dom.window.document;

  // Extract book title and author
  const bookTitle = document.querySelector(".bookTitle")?.textContent.trim();
  const authors = document.querySelector(".authors")?.textContent.trim();

  let markdown = `# ${bookTitle}\n\n**Author(s):** ${authors}\n\n---\n\n`;

  // Extract highlights
  const sections = document.querySelectorAll(".sectionHeading");
  sections.forEach((section) => {
    const sectionTitle = section.textContent.trim();
    markdown += `## ${sectionTitle}\n\n`;

    let current = section.nextElementSibling;
    while (current && !current.classList.contains("sectionHeading")) {
      if (
        current.classList.contains("noteHeading") &&
        current.textContent.toLowerCase().includes("highlight")
      ) {
        const noteText = current.nextElementSibling?.classList.contains(
          "noteText",
        )
          ? current.nextElementSibling.textContent
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/^./, (match) => match.toUpperCase())
          : "";

        const pageOrLocation = current.textContent.split(" - ")[1].trim();
        markdown += `- ${noteText} - ${pageOrLocation}\n\n`;
      }
      current = current.nextElementSibling;
    }

    markdown += "\n";
  });

  // Write to Markdown file
  const outputPath = path.join(
    process.cwd(),
    `${bookTitle.toLowerCase().replace(/\s+/g, "-")}.md`,
  );
  fs.writeFile(outputPath, markdown, (err) => {
    if (err) {
      console.error("Error writing the Markdown file:", err);
      process.exit(1);
    }
    console.log(`Markdown file saved at: ${outputPath}`);
  });
});
