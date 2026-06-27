"""
parser.py — PDF to Markdown conversion utility

Responsibility: One and only one thing.
    Receive a PDF file path via command-line argument,
    convert it to Markdown using Microsoft MarkItDown,
    print the Markdown to stdout.

This script is NOT a web server.
It has NO business logic.
It makes NO API calls.
It is called by documentParserService.js via child_process.spawn().

Usage:
    python parser.py <path_to_pdf>

Output:
    Prints Markdown text to stdout.
    Prints errors to stderr.
    Exits with code 0 on success, 1 on failure.
"""

import sys
import os


def parse_pdf_to_markdown(pdf_path: str) -> str:
    """Convert a PDF file to Markdown using MarkItDown."""
    from markitdown import MarkItDown

    converter = MarkItDown()
    result = converter.convert(pdf_path)
    return result.text_content


def main():
    if len(sys.argv) != 2:
        print("Usage: python parser.py <path_to_pdf>", file=sys.stderr)
        sys.exit(1)

    pdf_path = sys.argv[1]

    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    if not pdf_path.lower().endswith(".pdf"):
        print(f"Error: File is not a PDF: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    try:
        markdown = parse_pdf_to_markdown(pdf_path)

        if not markdown or not markdown.strip():
            print("Error: MarkItDown returned empty content.", file=sys.stderr)
            sys.exit(1)

        # Print ONLY the Markdown to stdout — nothing else.
        print(markdown, end="")

    except ImportError:
        print(
            "Error: 'markitdown' package is not installed.\n"
            "Install it with: pip install markitdown",
            file=sys.stderr,
        )
        sys.exit(1)

    except Exception as e:
        print(f"Error: Failed to convert PDF: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
